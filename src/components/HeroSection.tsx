import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Check, Lock, EyeOff, Timer, Flame } from "lucide-react";
import AutoplayVideo from "@/components/AutoplayVideo";

interface HeroSectionProps {
  onCTAClick: () => void;
}

const HeroSection = ({ onCTAClick }: HeroSectionProps) => {
  const [slots, setSlots] = useState<number>(() => {
    if (typeof window === "undefined") return 37;
    const stored = localStorage.getItem("mag_slots");
    const n = stored ? parseInt(stored, 10) : 37;
    return Number.isFinite(n) && n >= 1 ? n : 37;
  });
  const [online, setOnline] = useState<number>(() => 180 + Math.floor(Math.random() * 60));
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // Garante que o placeholder nunca fica preso: se o vídeo falhar ou demorar
    // demais, escondemos o "Carregando exemplo..." mesmo assim.
    const safety = window.setTimeout(() => setVideoReady(true), 8000);
    return () => window.clearTimeout(safety);
  }, []);

  useEffect(() => {
    const slotInterval = setInterval(() => {
      setSlots((prev) => {
        const next = prev > 1 ? prev - 1 : 1;
        localStorage.setItem("mag_slots", String(next));
        return next;
      });
    }, 45000);
    const onlineInterval = setInterval(() => {
      setOnline((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.min(320, Math.max(120, prev + delta));
      });
    }, 4000);
    return () => {
      clearInterval(slotInterval);
      clearInterval(onlineInterval);
    };
  }, []);

  const benefits = [
    "Manda a foto → recebe o vídeo em 30 segundos",
    "Realismo insano: rosto, corpo e movimento perfeitos",
    "100% anônimo — nada fica salvo, nem aparece pra ninguém",
    "Funciona no celular, sem instalar nada",
  ];

  return (
    <section className="relative pt-[calc(4.5rem+env(safe-area-inset-top))] md:pt-32 pb-12 md:pb-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="container relative z-10 flex flex-col">
        <div className="order-1 text-center space-y-5 md:space-y-7">
          {/* Live proof */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-semibold text-green-400">{online} caras gerando agora</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-red-500 icon-glow" />
              <span className="text-xs font-semibold text-red-400">
                Só {slots} {slots === 1 ? "vaga restante" : "vagas restantes"} hoje
              </span>
            </div>
          </div>
        </div>

        <div className="order-2 mt-6 md:mt-7 text-center space-y-5 md:space-y-7">
          {/* Main Headline */}
          <h1 className="text-[26px] leading-[1.15] sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight">
            <span className="text-foreground">Manda a foto dela.</span>
            <br />
            <span className="text-gradient-shine">Em 30 segundos</span>{" "}
            <span className="text-foreground"> gere ela</span> <span className="text-primary">pelada, mamando</span>{" "}
            <span className="text-foreground">ou</span> <span className="text-primary"> sendo fodida</span>.
          </h1>

          {/* Subheadline */}

          {/* Social Proof */}
          <p className="text-sm md:text-base text-muted-foreground font-medium">
            <span className="text-primary font-bold">+2.847 vídeos gerados</span> nas últimas 24 horas
            <span className="hidden sm:inline"> · nota 4,9/5 de quem já testou</span>
          </p>
        </div>

        {/* Video showcase */}
        <div className="order-3 mt-8 md:mt-14 max-w-sm mx-auto w-full">
          <div className="relative group">
            {/* Glow effect behind video */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-red-500/20 to-primary/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden card-glass border border-primary/20">
              {/* Loading placeholder (some celulares demoram pra puxar o vídeo) */}
              {!videoReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary/40 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Flame className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Carregando exemplo...
                  </span>
                </div>
              )}
              <AutoplayVideo
                className={`w-full h-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
                src="https://r2.fivemanage.com/X4YBLH3gO6rQLANQKCZmA/hero-opt(1).mp4"
                onPlaying={() => setVideoReady(true)}
                onCanPlay={() => setVideoReady(true)}
                onLoadedData={() => setVideoReady(true)}
                onError={() => setVideoReady(true)}
                {...({ fetchpriority: "high" } as any)}
              >
                Seu navegador não suporta vídeo.
              </AutoplayVideo>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-primary/30">
                <Flame className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                  Exemplo real gerado com 1 foto
                </span>
              </div>
            </div>
          </div>

          {/* Slots filled progress */}
          <div className="mt-6 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-2 text-xs font-medium">
              <span className="text-red-400">Vagas preenchidas hoje</span>
              <span className="text-primary font-bold">98%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/5 border border-primary/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-red-500 to-orange-500 transition-all duration-1000 ease-out shadow-[0_0_12px_hsl(var(--primary))]"
                style={{ width: "98%" }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground text-center">Vagas do dia encerram ao atingir 100%</p>
          </div>
        </div>

        {/* Benefits */}
        <ul className="order-5 mt-9 md:mt-12 grid gap-2.5 sm:grid-cols-2 max-w-2xl mx-auto text-left">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 card-glass rounded-xl px-4 py-3 border border-primary/10">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
                <Check className="w-3 h-3 text-primary" />
              </span>
              <span className="text-sm text-foreground/90 leading-snug">{b}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="order-4 mt-7 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Teste agora em poucos segundos</span>
            <Zap className="w-4 h-4" />
          </div>

          <Button
            size="lg"
            data-cta="experimentar"
            className="group relative w-full sm:w-auto bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] hover:bg-right text-primary-foreground font-bold px-10 py-7 text-lg rounded-2xl btn-glow transition-all duration-500"
            onClick={onCTAClick}
          >
            <span className="flex items-center justify-center gap-3">
              Experimentar agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" /> Sem cartão pra testar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-primary" /> 100% anônimo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-primary" /> Pronto em 30s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
