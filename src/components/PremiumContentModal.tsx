import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Crown, Eye, Check, Lock, Sparkles, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import melMaiaImage from "@/assets/premium/mel-maia.jpeg";
import virginiaImage from "@/assets/premium/virginia-fonseca.jpeg";
import { getStoredUtmParams } from "@/hooks/useUtmParams";

interface PremiumContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Celebrity {
  id: string;
  name: string;
  subtitle: string;
  image: string | null;
  isBlurred: boolean;
  isLoading: boolean;
}

const celebrities: Celebrity[] = [
  {
    id: "mel-maia",
    name: "Mel Maia",
    subtitle: "Atriz & Influencer",
    image: melMaiaImage,
    isBlurred: true,
    isLoading: false,
  },
  {
    id: "mc-melody",
    name: "Mc Melody",
    subtitle: "Cantora & Digital Influencer",
    image: null,
    isBlurred: true,
    isLoading: true,
  },
  {
    id: "mc-mirella",
    name: "Mc Mirella",
    subtitle: "Cantora & Influencer",
    image: null,
    isBlurred: true,
    isLoading: true,
  },
  {
    id: "nicolle-caroline",
    name: "Nicolle Caroline",
    subtitle: "Influencer Digital",
    image: null,
    isBlurred: true,
    isLoading: true,
  },
  {
    id: "virginia-fonseca",
    name: "Virginia Fonseca",
    subtitle: "Influencer & Empresária",
    image: virginiaImage,
    isBlurred: true,
    isLoading: false,
  },
  {
    id: "andressa-urach",
    name: "Andressa Urach",
    subtitle: "Modelo & Influencer",
    image: null,
    isBlurred: true,
    isLoading: true,
  },
];

const features = [
  {
    title: "Nudez Completa e Sem Censura",
    description: "Todas as celebridades peladas em conteúdo 100% explícito",
  },
  {
    title: "Alta Qualidade HD",
    description: "Imagens em resolução máxima sem marcas d'água",
  },
  {
    title: "Todos os Perfis Desbloqueados",
    description: "Acesso ilimitado a todo o conteúdo premium",
  },
  {
    title: "Atualizações Constantes",
    description: "Novos conteúdos explícitos toda semana",
  },
];

const PremiumContentModal = ({ isOpen, onClose }: PremiumContentModalProps) => {
  const navigate = useNavigate();

  const handlePurchase = () => {
    const params = new URLSearchParams({
      plan: "lifetime-unlimited",
      name: "Gerações Infinitas",
      amount: "1490",
      credits: "999999",
      isLifetime: "true",
      isPremium: "true",
    });

    // Append stored UTM params
    const utmParams = getStoredUtmParams();
    if (utmParams) {
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }

    navigate(`/checkout?${params.toString()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent fullscreen className="bg-gradient-to-b from-zinc-900 via-black to-zinc-950">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" />

        <div className="relative mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Conteúdo Premium VIP</h2>
              <p className="text-white/60">Celebridades brasileiras em conteúdo 100% explícito</p>
            </div>
          </div>

          {/* Adult Content Warning */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-red-900/20 border border-primary/30">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <span className="text-lg">🔞</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Conteúdo Adulto Explícito</h3>
                <p className="text-white/70 text-sm mt-1">
                  Ao adquirir o acesso premium, você terá conteúdo{" "}
                  <span className="text-primary font-bold">100% explícito e sem censura</span> de todas as celebridades
                  brasileiras listadas, incluindo nudez completa. Conteúdo exclusivo para maiores de 18 anos.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-white font-bold">Acesso Premium Inclui:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                    <p className="text-white/50 text-xs">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Celebrities Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-white/60" />
              <h3 className="text-white font-bold">Celebridades Disponíveis (Conteúdo Explícito)</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {celebrities.map((celebrity) => (
                <div
                  key={celebrity.id}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group"
                >
                  {/* Image or Loading State */}
                  {celebrity.isLoading ? (
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full border-3 border-white/10 border-t-primary animate-spin" />
                      </div>
                    </div>
                  ) : celebrity.image ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={celebrity.image}
                      alt={celebrity.name}
                      className={`w-full h-full object-cover ${celebrity.isBlurred ? "blur-[2px] scale-[1.02]" : ""}`}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900" />
                  )}

                  {/* Lock Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-black/60 border-2 border-primary/50 flex items-center justify-center backdrop-blur-sm">
                      <Lock className="h-7 w-7 text-primary" />
                    </div>
                  </div>

                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-bold text-sm">{celebrity.name}</h4>
                    <p className="text-white/60 text-xs">{celebrity.subtitle}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-semibold">
                        <Crown className="h-3 w-3" />
                        Exclusivo
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More Celebrities Banner */}
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-red-500/20 to-primary/20 border border-primary/30">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-white text-sm">
                E <span className="text-primary font-bold">MUITO MAIS</span> celebridades brasileiras peladas
                disponíveis!
              </span>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <p className="text-white/50 text-sm mt-2">
              Mais de <span className="text-primary font-bold">50+ celebridades e influencers</span> brasileiras em
              conteúdo 100% explícito
            </p>
          </div>

          {/* Purchase Section */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-primary/10 via-red-900/10 to-primary/10 border border-primary/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-white font-bold text-lg">Desbloqueie Todas Peladas Agora</h3>
                </div>
                <p className="text-white/60 text-sm">
                  Acesso vitalício a <span className="text-primary font-bold">TODAS</span> as celebridades nuas em
                  conteúdo 100% explícito e sem censura
                </p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-3xl font-black text-primary">R$ 24,90</span>
                  <span className="text-white/40 line-through">R$ 249,90</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">96% OFF</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-white/50 text-xs">
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-success" />
                    Pagamento único
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-success" />
                    Acesso para sempre
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-success" />
                    Todo conteúdo explícito
                  </span>
                </div>
              </div>
              <Button
                onClick={handlePurchase}
                className="bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 text-white font-bold px-6 py-6 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Lock className="h-5 w-5" />
                Ver Todas Peladas Agora
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              Pagamento Seguro
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              Acesso Imediato
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              100% Privado e Anônimo
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumContentModal;
