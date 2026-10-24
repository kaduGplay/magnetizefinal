import { useNavigate } from "react-router-dom";
import { Infinity as InfinityIcon, Sparkles, Check, X, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredUtmParams } from "@/hooks/useUtmParams";

interface LifetimeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLAN_ID = "lifetime-unlimited";
const PLAN_NAME = "Gerações Infinitas";
const AMOUNT_CENTS = 1490; // R$ 23,85
const CREDITS = 999999;

const LifetimeOfferModal = ({ isOpen, onClose }: LifetimeOfferModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleBuy = () => {
    const params = new URLSearchParams({
      plan: PLAN_ID,
      name: PLAN_NAME,
      amount: AMOUNT_CENTS.toString(),
      credits: CREDITS.toString(),
      isLifetime: "true",
      isPremium: "true",
    });
    const utm = getStoredUtmParams();
    if (utm) {
      Object.entries(utm).forEach(([k, v]) => {
        if (v) params.set(k, v as string);
      });
    }
    onClose();
    navigate(`/checkout?${params.toString()}`);
  };

  const features = [
    "Gerações infinitas — gere quantos quiser",
    "Baixe todos os vídeos e fotos em alta resolução",
    "Resultados super realistas, sem marca d'água",
    "Processamento prioritário, sem filas",
    "Pagamento único • acesso permanente",
  ];

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[130px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-md my-auto animate-in zoom-in-95 duration-300">
        <div className="absolute -inset-3 bg-gradient-to-r from-[#FF6B4A] via-red-500 to-[#FF3D3D] rounded-[2rem] blur-2xl opacity-40 animate-pulse" />

        <div className="relative bg-gradient-to-b from-[#1A1A1D] via-[#111113] to-[#0D0D0F] backdrop-blur-xl border border-primary/30 rounded-3xl p-6 sm:p-7 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 h-11 w-11 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-95 text-white/60 hover:text-white transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Best value badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-orange-500 shadow-lg shadow-primary/40">
              <Crown className="h-3 w-3 text-white" />
              <span className="text-[10px] font-black text-white tracking-wider uppercase">Melhor custo-benefício</span>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B4A] via-red-500 to-[#FF3D3D] flex items-center justify-center shadow-xl shadow-primary/50">
                <InfinityIcon className="h-11 w-11 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1.5 leading-tight tracking-tight">
              Gerações{" "}
              <span className="bg-gradient-to-r from-[#FF6B4A] to-[#FF3D3D] bg-clip-text text-transparent">
                Infinitas
              </span>
            </h3>
            <p className="text-white/60 text-sm px-2">
              Gere quantos vídeos e fotos quiser, baixe tudo em alta qualidade e sem marca d&apos;água.
            </p>
          </div>

          {/* Price */}
          <div className="text-center mb-5">
            <div className="inline-flex flex-col items-center">
              <span className="text-white/35 text-sm line-through">De R$ 249,90</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-white/60 text-lg font-semibold">R$</span>
                <span className="text-6xl font-black bg-gradient-to-r from-[#FF6B4A] via-red-500 to-[#FF3D3D] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,61,61,0.4)]">
                  14,90
                </span>
              </div>
              <span className="text-white/50 text-xs mt-1">pagamento único • acesso permanente</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-5 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" strokeWidth={3} />
                </div>
                <span className="text-white/85 text-sm leading-tight">{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={handleBuy}
            className="relative w-full h-[56px] rounded-2xl bg-gradient-to-r from-[#FF6B4A] via-red-500 to-[#FF3D3D] bg-[length:200%_100%] hover:bg-right text-white font-black text-base shadow-[0_10px_40px_-10px_rgba(255,61,61,0.75)] active:scale-[0.98] transition-all overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Sparkles className="h-5 w-5 mr-2" />
            Liberar Gerações Infinitas
          </Button>

          <div className="flex items-center justify-center gap-1.5 mt-3 text-white/45 text-[11px]">
            <Lock className="h-3 w-3" />
            <span>Pagamento seguro via PIX</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-2 text-white/35 hover:text-white/60 text-[11px] font-medium transition-colors"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifetimeOfferModal;
