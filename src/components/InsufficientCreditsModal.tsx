import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Infinity as InfinityIcon,
  LockKeyhole,
  Sparkles,
  Zap,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { getStoredUtmParams } from "@/hooks/useUtmParams";

import { initTikTokPixel, trackAddToCart, trackInitiateCheckout } from "@/lib/tiktok-pixel";

export const GENERATION_COST = 100;

export const PLANS = {
  credits: {
    id: "credit-pack-500",
    name: "500 Créditos",
    amountCents: 990,
    credits: 500,
    isLifetime: false,
    isPremium: false,
    tag: "Pacote inicial",
    title: "500 créditos",
    subtitle: "Gere até 5 vídeos",
    ctaLabel: "Desbloquear 500 créditos",
    price: "R$ 9,90",
    anchor: null,
  },
  lifetime: {
    id: "lifetime-unlimited",
    name: "Plano Vitalício",
    amountCents: 1490,
    credits: 999999,
    isLifetime: true,
    isPremium: true,
    tag: "Melhor custo-benefício",
    title: "Vídeos ilimitados",
    subtitle: "Gere vídeos sem limite de créditos",
    ctaLabel: "Garantir acesso vitalício",
    price: "R$ 14,90",
    anchor: null,
  },
} as const;

type PlanKey = keyof typeof PLANS;

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDefer?: () => void;
  context?: "generation" | "browse";
  onBuyCredits: () => void;
  currentCredits: number;
  requiredCredits: number;
  mediaType?: "photo" | "video";
}

const InsufficientCreditsModal = ({ isOpen, onClose, onDefer, context = "generation" }: InsufficientCreditsModalProps) => {
  const [selected, setSelected] = useState<PlanKey>("credits");
  const checkoutStarted = useRef(false);

  const selectedPlan = PLANS[selected];

  useEffect(() => {
    if (isOpen) {
      setSelected("credits");
      checkoutStarted.current = false;
    }
  }, [isOpen]);

  const goToCheckout = () => {
    if (checkoutStarted.current) return;

    checkoutStarted.current = true;

    const plan = PLANS[selected];

    const params = new URLSearchParams({
      plan: plan.id,
      name: plan.name,
      amount: plan.amountCents.toString(),
      credits: plan.credits.toString(),
      isLifetime: plan.isLifetime ? "true" : "false",
      isPremium: plan.isPremium ? "true" : "false",
    });

    try {
      const utm = getStoredUtmParams();

      if (utm) {
        Object.entries(utm).forEach(([key, value]) => {
          if (value) {
            params.set(key, String(value));
          }
        });
      }
    } catch (error) {
      console.error("Erro ao recuperar UTMs:", error);
    }

    try {
      initTikTokPixel();

      trackAddToCart({
        content_name: plan.name,
        value: plan.amountCents / 100,
        currency: "BRL",
      });

      trackInitiateCheckout({
        content_name: plan.name,
        value: plan.amountCents / 100,
        currency: "BRL",
      });
    } catch (error) {
      console.error("Erro ao registrar eventos:", error);
    }

    window.location.assign(`/checkout?${params.toString()}`);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="
          flex
          max-h-[94dvh]
          w-[calc(100vw-1rem)]
          max-w-[430px]
          flex-col
          gap-0
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          p-0
          shadow-2xl
          font-body
        "
      >
        {/* CONTEÚDO */}
        <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-6 sm:px-6">
          {/* ÍCONE */}
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>

          {context === "generation" && <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-primary">Geração escolhida · Etapa de créditos</p>}
          {/* TÍTULO */}
          <DialogTitle className="pr-5 text-center font-display text-[23px] font-bold leading-tight text-foreground">
            {context === "browse" ? "Conheça nossos planos" : "Para gerar, compre créditos"}
          </DialogTitle>

          {/* DESCRIÇÃO */}
          <DialogDescription className="mx-auto mt-2 max-w-[340px] text-center text-[13px] leading-relaxed text-muted-foreground">
            {context === "browse" ? "Compare as opções e escolha o plano ideal para você. Pagamento único, sem mensalidade." : "Esta é a etapa de compra dos créditos. Escolha um plano abaixo. Os créditos serão liberados após a confirmação do pagamento via PIX."}
          </DialogDescription>

          {/* DESTAQUE */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-3">
            <Zap className="h-4 w-4 shrink-0 text-primary" />

            <p className="text-center text-xs font-medium text-foreground">
              {context === "browse" ? "Créditos ou acesso vitalício: escolha como continuar" : `Esta geração usa ${GENERATION_COST} créditos. O saldo também pode ser usado nas próximas.`}
            </p>
          </div>

          {/* TÍTULO DOS PLANOS */}
          <div className="mb-3 mt-5 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground">Escolha seu plano</h3>

            <span className="text-[11px] text-muted-foreground">Sem mensalidade</span>
          </div>

          {/* PLANOS */}
          <div className="space-y-3" role="group" aria-label="Escolha seu plano">
            {/* PACOTE DE CRÉDITOS */}
            <button
              type="button"
              aria-pressed={selected === "credits"}
              onClick={() => setSelected("credits")}
              className={`
                relative w-full rounded-xl border-2 p-4 text-left
                transition-all duration-200
                ${
                  selected === "credits"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-secondary/20 hover:border-primary/40"
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">PARA COMEÇAR</span>

                  <h4 className="mt-1 text-[17px] font-bold text-foreground">500 créditos</h4>

                  <p className="mt-1 text-xs text-muted-foreground">Gere até 5 vídeos com seus créditos</p>
                </div>

                <div
                  className={`
                    flex h-5 w-5 shrink-0 items-center justify-center
                    rounded-full border-2
                    ${
                      selected === "credits"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }
                  `}
                >
                  {selected === "credits" && <Check className="h-3 w-3" />}
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <span className="text-[27px] font-extrabold leading-none text-foreground">R$ 9,90</span>

                  <p className="mt-1 text-[11px] text-muted-foreground">Pagamento único</p>
                </div>

                <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  Pacote inicial
                </span>
              </div>
            </button>

            {/* PLANO VITALÍCIO */}
            <button
              type="button"
              aria-pressed={selected === "lifetime"}
              onClick={() => setSelected("lifetime")}
              className={`
                relative mt-4 w-full rounded-xl border-2 p-4
                text-left transition-all duration-200
                ${
                  selected === "lifetime"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-primary/50 bg-primary/5 hover:border-primary"
                }
              `}
            >
              {/* SELO */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  MELHOR CUSTO-BENEFÍCIO
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-primary">PAGUE UMA VEZ, USE SEMPRE</span>

                  <div className="mt-1 flex items-center gap-2">
                    <InfinityIcon className="h-5 w-5 shrink-0 text-primary" />

                    <h4 className="text-[17px] font-bold text-foreground">Vídeos ilimitados</h4>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">Acesso vitalício, sem precisar recarregar</p>
                </div>

                <div
                  className={`
                    flex h-5 w-5 shrink-0 items-center justify-center
                    rounded-full border-2
                    ${
                      selected === "lifetime"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }
                  `}
                >
                  {selected === "lifetime" && <Check className="h-3 w-3" />}
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <span className="text-[27px] font-extrabold leading-none text-foreground">R$ 14,90</span>

                  <p className="mt-1 text-[11px] text-muted-foreground">Uma única vez, sem mensalidades</p>
                </div>

                <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                  SEM RECARGAS
                </span>
              </div>

              {/* BENEFÍCIOS */}
              <div className="mt-3 space-y-2 border-t border-primary/15 pt-3">
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  Gere vídeos sem limite de créditos
                </div>

                <div className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  Crie novos vídeos quando quiser
                </div>

                <div className="flex items-center gap-2 text-xs text-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  Acesso vitalício, sem mensalidades
                </div>
              </div>
            </button>
          </div>

          {/* REFORÇO */}
          <div className="mt-4 text-center">
            <p className="text-xs font-medium text-foreground">{context === "browse" ? "Seu plano, sua escolha" : "Seu próximo vídeo começa aqui"}</p>

            <p className="mt-1 text-[11px] text-muted-foreground">Escolha seu plano e continue criando.</p>
          </div>
        </div>

        {/* RODAPÉ FIXO */}
        <div className="shrink-0 border-t border-border bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          {/* RESUMO */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] text-muted-foreground">Seu plano selecionado</p>

              <p className="text-sm font-semibold text-foreground">
                {selected === "credits" ? "500 créditos" : "Vídeos ilimitados"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-extrabold text-foreground">{selectedPlan.price}</p>

              <p className="text-[10px] text-muted-foreground">Pagamento único</p>
            </div>
          </div>

          {/* BOTÃO DE COMPRA */}
          <Button
            type="button"
            onClick={goToCheckout}
            className="
              h-[54px] w-full gap-2 rounded-xl
              text-sm font-bold shadow-lg
              transition-all duration-200
              hover:brightness-110
              active:scale-[0.99]
            "
          >
            <LockKeyhole className="h-4 w-4 shrink-0" />

            <span className="min-w-0 whitespace-normal leading-tight">Ir para pagamento · {selectedPlan.price}</span>

            <ArrowRight className="h-4 w-4 shrink-0" />
          </Button>

          {/* SEGURANÇA */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <LockKeyhole className="h-3 w-3" />
            Pagamento via PIX
            <span>•</span>
            <CreditCard className="h-3 w-3" />
            Compra única
          </div>

          {/* FECHAR */}
          <button
            type="button"
            onClick={onDefer || onClose}
            className="mt-2 w-full py-1 text-center text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Continuar depois
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsufficientCreditsModal;
