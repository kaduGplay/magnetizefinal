import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Infinity as InfinityIcon, Loader2, LockKeyhole, Sparkles } from "lucide-react";

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
  const [checkoutPlan, setCheckoutPlan] = useState<PlanKey | null>(null);
  const checkoutStarted = useRef(false);



  useEffect(() => {
    if (isOpen) {
      setCheckoutPlan(null);
      checkoutStarted.current = false;
    }
  }, [isOpen]);

  const goToCheckout = (key: PlanKey) => {
    if (checkoutStarted.current) return;

    checkoutStarted.current = true;
    setCheckoutPlan(key);

    const plan = PLANS[key];

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

  const priceDifference = ((PLANS.lifetime.amountCents - PLANS.credits.amountCents) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="flex max-h-[94dvh] w-[calc(100vw-1rem)] max-w-[430px] flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl font-body">
        <div className="min-h-0 overflow-y-auto px-4 pb-4 pt-5 sm:px-6">
          <div className="mb-3 flex justify-center"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div></div>
          <DialogTitle className="px-6 text-center font-display text-[23px] font-bold leading-tight text-foreground">{context === "generation" ? "Desbloqueie esta geração" : "Escolha seu plano"}</DialogTitle>
          <DialogDescription className="mx-auto mb-5 mt-2 max-w-[340px] text-center text-[13px] leading-relaxed text-muted-foreground">{context === "generation" ? "Use os créditos para iniciar a geração escolhida e criar outras depois." : "Créditos para começar a criar ou acesso vitalício para continuar quando quiser."}</DialogDescription>

          <div className="space-y-4" role="group" aria-label="Escolha seu plano">
            <section aria-labelledby="credits-plan-title" className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><h3 id="credits-plan-title" className="text-base font-bold text-foreground">{PLANS.credits.title}</h3><p className="mt-1 text-xs text-muted-foreground">Até {PLANS.credits.credits / GENERATION_COST} vídeos com seus créditos</p></div>
                <span className="whitespace-nowrap text-xl font-extrabold text-foreground">{PLANS.credits.price}</span>
              </div>
              <Button type="button" variant="outline" disabled={checkoutPlan !== null} onClick={() => goToCheckout("credits")} className="mt-4 h-12 w-full touch-manipulation rounded-xl border-primary/40 text-sm font-bold">
                {checkoutPlan === "credits" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                <span className="min-w-0 whitespace-normal leading-tight">Desbloquear por {PLANS.credits.price}</span><ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section aria-labelledby="lifetime-plan-title" className="rounded-xl border-2 border-primary bg-primary/5 p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary"><Sparkles className="h-3.5 w-3.5" />Melhor custo-benefício</p>
              <div className="flex items-start justify-between gap-3">
                <div><h3 id="lifetime-plan-title" className="flex items-center gap-2 text-base font-bold text-foreground"><InfinityIcon className="h-5 w-5 text-primary" />Acesso vitalício</h3><p className="mt-1 text-xs text-muted-foreground">Sem limite de créditos</p></div>
                <span className="whitespace-nowrap text-xl font-extrabold text-foreground">{PLANS.lifetime.price}</span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />Vitalício por mais {priceDifference}</p>
              <Button type="button" disabled={checkoutPlan !== null} onClick={() => goToCheckout("lifetime")} className="mt-4 h-12 w-full touch-manipulation rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
                {checkoutPlan === "lifetime" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                <span className="min-w-0 whitespace-normal leading-tight">Desbloquear vitalício por {PLANS.lifetime.price}</span><ArrowRight className="h-4 w-4" />
              </Button>
            </section>
          </div>
        </div>
        <div className="shrink-0 border-t border-border bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><LockKeyhole className="h-3 w-3" />Pagamento único via PIX · Sem mensalidade</p>
          <button type="button" onClick={onDefer || onClose} className="mt-1 min-h-11 w-full touch-manipulation text-center text-xs text-muted-foreground transition-colors hover:text-foreground">Continuar depois</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsufficientCreditsModal;
