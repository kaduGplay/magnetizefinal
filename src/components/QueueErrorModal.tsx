import { useState } from "react";
import { AlertTriangle, Rocket, Clock, Zap, Crown, Infinity, Users, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { callAccessApi, useAuth } from "@/hooks/useAuth";
import { GENERATION_COST } from "./InsufficientCreditsModal";
import GenerationFailedModal from "./GenerationFailedModal";
import { getStoredUtmParams } from "@/hooks/useUtmParams";

interface QueueErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITY_PRICE = 890; // R$ 8,90 em centavos

const QueueErrorModal = ({
  isOpen,
  onClose,
}: QueueErrorModalProps) => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);

  const handleBuyPriority = () => {
    onClose();
    const params = new URLSearchParams({
      plan: 'priority-lifetime-890',
      name: 'Gerações Infinitas',
      amount: PRIORITY_PRICE.toString(),
      credits: '999999',
      isLifetime: 'true',
      isPremium: 'true',
    });
    
    // Append stored UTM params
    const utmParams = getStoredUtmParams();
    if (utmParams) {
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    
    navigate(`/checkout?${params.toString()}`);
  };

  const handleWaitInQueue = async () => {
    if (!profile?.id) return;
    
    setIsProcessing(true);
    
    try {
      // Deduct credits from user account
      const result = await callAccessApi({ action: "deduct-credits", amount: GENERATION_COST });
      if (!result.success) throw new Error(String(result.error || "Erro ao usar créditos."));
      
      // Refresh profile to update credits display
      await refreshProfile();
      
      // Close this modal and show generation failed modal
      onClose();
      setShowFailedModal(true);
    } catch (err) {
      console.error("Error processing queue wait:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const benefits = [
    "Geração instantânea sem fila",
    "Prioridade máxima 24/7",
    "Acesso permanente garantido",
    "Suporte prioritário VIP"
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md w-[calc(100vw-1rem)] max-h-[90dvh] bg-gradient-to-b from-zinc-900 via-zinc-900 to-black border-white/10 p-0 gap-0 overflow-hidden flex flex-col">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Error Icon with Pulse */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/30 blur-3xl rounded-full animate-pulse" />
                <div className="relative p-5 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">
                Servidores Lotados! 😰
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Infelizmente há <span className="text-yellow-400 font-bold">muitas pessoas</span> na fila de geração neste momento.
                Sua geração foi colocada em espera.
              </p>
            </div>

            {/* Queue Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <Users className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-black text-white">+847</span>
                <span className="text-white/50 text-xs">pessoas na fila</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                <Clock className="h-6 w-6 text-orange-500" />
                <span className="text-2xl font-black text-white">~45min</span>
                <span className="text-white/50 text-xs">tempo estimado</span>
              </div>
            </div>

            {/* Priority Offer Card */}
            <div className="relative rounded-2xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-yellow-500 via-orange-500 to-primary bg-[length:300%_100%] animate-[shimmer_3s_linear_infinite] p-[2px] rounded-2xl">
                <div className="absolute inset-[2px] bg-gradient-to-b from-zinc-900 to-black rounded-2xl" />
              </div>
              
              <div className="relative p-5 space-y-4">
                {/* Header with Icons */}
                <div className="flex items-center justify-center gap-3">
                  <Rocket className="h-6 w-6 text-primary animate-bounce" />
                  <span className="text-xl font-black text-white tracking-wide">FURE A FILA</span>
                  <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/30 to-red-500/30 text-primary border border-primary/40">
                    <Infinity className="h-3.5 w-3.5" />
                    VITALÍCIO
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                    <Zap className="h-3.5 w-3.5" />
                    INSTANTÂNEO
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                    <Crown className="h-3.5 w-3.5" />
                    VIP
                  </span>
                </div>

                {/* Benefits List */}
                <div className="space-y-2 py-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Price Section */}
                <div className="text-center py-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-white/40 line-through text-sm">R$ 49,90</span>
                      <span className="text-[10px] text-white/30">preço normal</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-4xl font-black bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
                        R$ 8,90
                      </span>
                      <span className="text-green-400 text-xs font-bold">pagamento único</span>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <span className="text-green-400 text-xs font-bold">💰 Economia de 82%!</span>
                  </div>
                </div>

                {/* Urgency Text */}
                <p className="text-center text-xs text-white/50">
                  ⚡ Oferta <span className="text-yellow-400 font-bold">limitada</span> - Apenas <span className="text-primary font-bold">23 vagas</span> restantes hoje!
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleBuyPriority}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-primary via-red-500 to-orange-500 bg-[length:200%_100%] hover:bg-[length:100%_100%] text-white text-lg font-black shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-all duration-500 flex items-center justify-center gap-2 animate-pulse"
              >
                <Rocket className="h-5 w-5" />
                GERAR INSTANTANEAMENTE 🚀
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleWaitInQueue}
                disabled={isProcessing}
                className="w-full h-11 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5 text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Continuar esperando na fila (~45 min)"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GenerationFailedModal
        isOpen={showFailedModal}
        onClose={() => setShowFailedModal(false)}
      />
    </>
  );
};

export default QueueErrorModal;
