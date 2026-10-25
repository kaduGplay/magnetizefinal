import { useEffect, useState } from "react";
import { MousePointerClick, Lock, EyeOff, Shield, Play, Crown, Zap, Menu, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateAccountModal from "@/components/CreateAccountModal";
import LoginCodeModal from "@/components/LoginCodeModal";
import PhotoUploadModal from "@/components/PhotoUploadModal";
import InsufficientCreditsModal, { GENERATION_COST } from "@/components/InsufficientCreditsModal";
import UserAccountModal from "@/components/UserAccountModal";
import CreditsModal from "@/components/CreditsModal";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useUtmCapture } from "@/hooks/useUtmParams";
import { listaDeVideos } from "@/videos/listaDeVideos";
import AutoplayVideo from "@/components/AutoplayVideo";
import ExitDownsellModal, { type DownsellPlan } from "@/components/ExitDownsellModal";
import ServerQueueModal, { type PriorityPlan } from "@/components/ServerQueueModal";
import { getStoredUtmParams } from "@/hooks/useUtmParams";
import { initTikTokPixel, trackAddToCart, trackInitiateCheckout } from "@/lib/tiktok-pixel";
import { clearGenerationIntent, consumeGenerationIntent, saveGenerationIntent } from "@/lib/generationIntent";
import PendingCheckoutNotice from "@/components/PendingCheckoutNotice";
import { generationStep } from "@/lib/generationStep";

// Alterna tamanhos para o mosaico ficar bonito: um maior, outro menor
const tamanhos = ["aspect-[9/16]", "aspect-[3/4]", "aspect-[2/3]", "aspect-[4/5]"];

const Dashboard = () => {
  useUtmCapture();
  // Sempre abrir a dashboard no topo da página
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const [mostrarPlanos, setMostrarPlanos] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarOferta, setMostrarOferta] = useState(false);
  const [mostrarFila, setMostrarFila] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [planosDaGeracao, setPlanosDaGeracao] = useState(false);

  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const [mostrarConta, setMostrarConta] = useState(false);
  const abrirConta = () => {
    if (isAuthenticated) setMostrarConta(true);
    else setMostrarLogin(true);
  };
  // Foto → criar conta ou seletor de planos, direto.
  const [etapa, setEtapa] = useState<null | "foto" | "planos" | "creditos">(null);
  const espera = (fn: () => void) => setTimeout(fn, 260);
  const abrirPlanos = () => {
    setMenuAberto(false);
    setPlanosDaGeracao(false);
    setEtapa("planos");
  };

  // Retoma somente a escolha feita antes de entrar; fechar permite trocar o vídeo.
  const continuarAposLogin = () => {
    setMostrarPlanos(false);
    setMostrarLogin(false);
    const index = consumeGenerationIntent(listaDeVideos.map(video => video.link));
    if (index !== null) {
      setEscolhido(index);
      setEtapa("foto");
    }
  };

  useEffect(() => {
    if (isAuthenticated) continuarAposLogin();
  }, [isAuthenticated]);

  const escolher = (idx: number) => {
    setEscolhido(idx);
    setEtapa("foto");
  };

  const fotoEnviada = () => {
    setEtapa(null);
    const nextStep = generationStep(isAuthenticated, profile?.credits ?? 0, GENERATION_COST);
    if (nextStep === "account") {
      if (escolhido !== null && listaDeVideos[escolhido]) {
        saveGenerationIntent(listaDeVideos[escolhido].link);
      }
      espera(() => setMostrarPlanos(true));
    } else if (nextStep === "queue") {
      // Quem já tem créditos pra gerar vê o modal de servidores lotados
      // com a oferta prioritária vitalícia, em vez do seletor de planos.
      espera(() => setMostrarFila(true));
    } else {
      setPlanosDaGeracao(true);
      espera(() => setEtapa("planos"));
    }
  };

  const fecharPlanos = () => {
    setEtapa(null);
    if (planosDaGeracao) setMostrarOferta(true);
  };
  const continuarDepois = fecharPlanos;

  const comprarOferta = (plan: DownsellPlan | PriorityPlan) => {
    initTikTokPixel();
    const event = { content_name: plan.name, value: plan.amountCents / 100, currency: "BRL" };
    trackAddToCart(event);
    const params = new URLSearchParams({
      plan: plan.id,
      name: plan.name,
      amount: String(plan.amountCents),
      credits: String(plan.credits),
      isLifetime: String(plan.isLifetime),
      isPremium: String(plan.isPremium),
    });
    Object.entries(getStoredUtmParams() ?? {}).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    trackInitiateCheckout(event);
    window.location.assign(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />
        <div className="container relative flex h-16 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button type="button" variant="ghost" size="icon" aria-label="Abrir menu" aria-expanded={menuAberto} aria-controls="dashboard-navigation" onClick={() => setMenuAberto(true)} className="h-12 w-12 shrink-0 touch-manipulation rounded-xl"><Menu className="h-5 w-5" /></Button>
            <img src="/media/logo.jpeg" alt="Magnetize" className="h-7 w-auto max-w-[90px] rounded-lg object-contain" />
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={abrirPlanos}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-bold bg-white/5 border-white/10 text-foreground hover:bg-white/10"
            >
              <Zap className="h-3.5 w-3.5 text-primary" />{profile?.credits ?? 0}
            </button>
            <Button
              onClick={abrirPlanos}
              className="inline-flex touch-manipulation bg-gradient-to-r from-primary to-red-600 text-primary-foreground text-xs px-3 py-2 h-12 gap-1.5 rounded-xl shadow-lg shadow-primary/25"
            >
              <Crown className="h-4 w-4" />
              <span>Ver planos</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={abrirConta}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-red-600 text-primary-foreground shadow-lg shadow-primary/30"
              aria-label="Minha conta"
              disabled={authLoading}
            >
              <KeyRound className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container relative px-4 py-8 pb-10">
        <PendingCheckoutNotice userId={profile?.id} />
        {/* Boas-vindas */}
        <div className="mb-6 md:mb-8">
          <div className="relative rounded-3xl overflow-hidden card-glass border border-primary/20 p-5 md:p-7">
            <div className="absolute -top-16 -right-10 h-48 w-48 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-primary/40 blur-xl rounded-2xl" />
                  <div className="relative h-14 w-14 rounded-2xl number-badge flex items-center justify-center text-primary-foreground">
                    <KeyRound className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    <span className="text-gradient-shine">Olá, {profile?.full_name || "Cliente"}</span>
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1 max-w-lg">
                    Tudo por aqui é <span className="text-success font-medium">100% anônimo</span> — nada fica salvo.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 md:min-w-[320px]">
                {[
                  { icon: Crown, value: profile?.is_premium ? "Premium" : "Básico", label: "Seu plano", cls: "text-primary" },
                  { icon: Zap, value: "30s", label: "Por geração", cls: "text-primary" },
                  { icon: Shield, value: "100%", label: "Sigiloso", cls: "text-success" },
                ].map(({ icon: Icon, value, label, cls }) => (
                  <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${cls}`} />
                    <p className="text-lg font-black text-foreground leading-none">{value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="mb-8 md:mb-10">
          <div className="relative card-glass rounded-2xl overflow-hidden border border-primary/20">
            <img src="/media/Designsemnome.gif" alt="Exemplo de resultado ultrarrealista" className="block h-auto w-full" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-3 md:px-6 md:pb-4">
              <p className="text-xs md:text-sm font-semibold text-foreground drop-shadow-md">
                Resultados ultra-realistas em <span className="text-primary">segundos</span>
              </p>
            </div>
          </div>
        </div>

        {/* Como funciona */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm">
          <div className="relative border-b border-border/50 px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Como funciona</p>
            <h2 className="mt-0.5 text-lg md:text-xl font-bold text-foreground">Da foto ao resultado em 3 toques</h2>
          </div>
          <ol className="relative grid sm:grid-cols-3">
            {[
              { step: "01", title: "Escolhe o vídeo", text: "Toca num dos vídeos aqui embaixo." },
              { step: "02", title: "Manda a foto dela", text: "Uma foto com o rosto visível já basta. Quanto mais nítida, melhor." },
              { step: "03", title: "Recebe na hora", text: "O resultado aparece só pra você, em segundos. Nada fica salvo." },
            ].map((s, i) => (
              <li key={s.step} className={`relative flex gap-4 px-5 py-4 sm:flex-col sm:gap-3 sm:py-5 ${i > 0 ? "border-t border-border/40 sm:border-t-0 sm:border-l" : ""}`}>
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-[11px] font-black text-primary">{s.step}</span>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => document.getElementById("video-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="relative flex w-full items-center justify-center gap-2 border-t border-border/50 bg-primary/5 px-5 py-3.5 text-sm font-bold text-primary hover:bg-primary/10"
          >
            <MousePointerClick className="h-4 w-4" />
            Escolher um vídeo agora
            <span className="animate-bounce">↓</span>
          </button>
        </div>

        <div id="video-section" className="scroll-mt-24" />
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <MousePointerClick className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-wide">
              Escolha o seu vídeo
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
          {listaDeVideos.map((video, idx) => (
            <button
              key={`${video.link}-${idx}`}
              type="button"
              onClick={() => escolher(idx)}
              className={`group relative mb-3 md:mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all hover:ring-2 hover:ring-primary ${
                tamanhos[idx % tamanhos.length]
              } ${escolhido === idx ? "ring-2 ring-primary" : ""}`}
            >
              <AutoplayVideo
                src={video.link || undefined}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <p className="text-sm font-bold text-foreground leading-tight">{video.descricao}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                  <Play className="h-3 w-3" />
                  Gerar este
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 py-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center text-muted-foreground">
            <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-success" /><span className="text-sm">Criptografia de ponta a ponta</span></div>
            <div className="flex items-center gap-2"><EyeOff className="h-4 w-4 text-success" /><span className="text-sm">Nenhuma imagem é armazenada</span></div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-success" /><span className="text-sm">Processamento 100% automático</span></div>
          </div>
        </div>
      </main>

      {menuAberto && <AppSidebar isOpen onClose={() => setMenuAberto(false)} onOpenCredits={abrirPlanos} onOpenAccount={abrirConta} credits={profile?.credits ?? 0} isPremium={profile?.is_premium ?? false} />}
      <UserAccountModal
        isOpen={mostrarConta && isAuthenticated}
        onClose={() => setMostrarConta(false)}
        onOpenCredits={() => { setMostrarConta(false); abrirPlanos(); }}
      />

      <PhotoUploadModal
        isOpen={etapa === "foto"}
        onClose={() => setEtapa(null)}
        onContinue={fotoEnviada}
        selectedVideoUrl={escolhido !== null ? listaDeVideos[escolhido]?.link : null}
      />

      {/* Sem conta: retoma o template depois de entrar. */}
      <CreateAccountModal
        isOpen={mostrarPlanos}
        onClose={() => { setMostrarPlanos(false); clearGenerationIntent(); }}
        onOpenLogin={() => { setMostrarPlanos(false); setMostrarLogin(true); }}
        onSuccess={continuarAposLogin}
      />
      <LoginCodeModal
        isOpen={mostrarLogin}
        onClose={() => { setMostrarLogin(false); clearGenerationIntent(); }}
        onCreateNew={() => { setMostrarLogin(false); setMostrarPlanos(true); }}
        onSuccess={continuarAposLogin}
      />

      {/* Sem etapa de aviso: os planos abrem direto após a foto. */}
      <InsufficientCreditsModal
        isOpen={etapa === "planos"}
        onClose={fecharPlanos}
        onDefer={continuarDepois}
        context={planosDaGeracao ? "generation" : "browse"}
        onBuyCredits={() => { setEtapa(null); espera(() => setEtapa("creditos")); }}
        currentCredits={profile?.credits ?? 0}
        requiredCredits={GENERATION_COST}
        mediaType="video"
      />
      <CreditsModal isOpen={etapa === "creditos"} onClose={fecharPlanos} />
      <ExitDownsellModal
        isOpen={mostrarOferta}
        onClose={() => setMostrarOferta(false)}
        onAccept={comprarOferta}
      />
      {/* Quem tem créditos pra gerar vê a fila com a oferta prioritária. */}
      <ServerQueueModal
        isOpen={mostrarFila}
        onClose={() => setMostrarFila(false)}
        onAccept={(plan) => { setMostrarFila(false); comprarOferta(plan); }}
      />
    </div>
  );
};

export default Dashboard;
