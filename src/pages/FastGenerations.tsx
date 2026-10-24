import { useEffect, useState } from "react";
import { ArrowLeft, Video, Image, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import InsufficientCreditsModal from "@/components/InsufficientCreditsModal";
import ExitDownsellModal from "@/components/ExitDownsellModal";
import { getStoredUtmParams } from "@/hooks/useUtmParams";
import { initTikTokPixel, trackAddToCart, trackInitiateCheckout } from "@/lib/tiktok-pixel";
import FastGenLoadingModal from "@/components/FastGenLoadingModal";
import QueueErrorModal from "@/components/QueueErrorModal";
import CreditsModal from "@/components/CreditsModal";

interface Model {
  id: string;
  name: string;
  subtitle?: string;
  tags: string[];
  imageUrl: string;
}

const VIDEO_COST = 100;
const IMAGE_COST = 100;

const models: Model[] = [
  {
    id: "joana-marques",
    name: "Joana Marques",
    tags: ["Gótica", "Safada", "Jovem Adulta", "Malhada", "Magrinha"],
    imageUrl: "/media/fast_gen_02.jpeg"
  },
  {
    id: "giovanna-soares",
    name: "Giovanna Soares",
    subtitle: "Colega de Sala",
    tags: ["Inocente", "Jovem Adulta", "Magrinha", "Patricinha"],
    imageUrl: "/media/fast_gen_03.jpeg"
  },
  {
    id: "alice-andrews",
    name: "Alice Andrews",
    subtitle: "Universitária",
    tags: ["Líder de Torcida", "Jovem Adulta", "Gostosa"],
    imageUrl: "/media/fast_gen_04.jpeg"
  },
  {
    id: "maria-clara",
    name: "Maria Clara",
    tags: ["Jovem Adulta"],
    imageUrl: "/media/fast_gen_05.jpeg"
  },
  {
    id: "marcela-albuquerque",
    name: "Marcela Albuquerque",
    subtitle: "Filha do Chefe",
    tags: ["Patricinha", "Jovem Adulta", "Magrinha"],
    imageUrl: "/media/fast_gen_06.jpeg"
  },
  {
    id: "luiza-alves",
    name: "Luiza Alves",
    tags: ["Gótica", "Safada", "Jovem Adulta", "Magrinha"],
    imageUrl: "/media/fast_gen_07.jpeg"
  },
  {
    id: "gabriela-matos",
    name: "Gabriela Matos",
    tags: ["Tatuada", "Jovem Adulta", "MILF", "Gostosa"],
    imageUrl: "/media/fast_gen_08.jpeg"
  },
  {
    id: "paula-vieira",
    name: "Paula Vieira",
    subtitle: "Tia do Amigo",
    tags: ["MILF", "Gostosa"],
    imageUrl: "/media/fast_gen_09.jpeg"
  },
  {
    id: "laila-rafaela",
    name: "Laila e Rafaela",
    subtitle: "Naturais",
    tags: ["Dupla", "Jovem Adulta", "Magrinha"],
    imageUrl: "/media/fast_gen_10.jpeg"
  },
  {
    id: "ana-julia",
    name: "Ana Julia",
    subtitle: "Miss da Cidade",
    tags: ["Gostosa", "Jovem Adulta", "Famosa"],
    imageUrl: "/media/fast_gen_11.jpeg"
  },
  {
    id: "julia-vasconcellos",
    name: "Julia Vasconcellos",
    tags: ["Patricinha", "Jovem Adulta", "Magrinha"],
    imageUrl: "/media/fast_gen_12.jpeg"
  },
  {
    id: "leticia-mariana",
    name: "Leticia e Mariana",
    subtitle: "Melhores Amigas",
    tags: ["Dupla", "Jovem Adulta", "Magrinha"],
    imageUrl: "/media/fast_gen_13.jpeg"
  }
];

const FastGenerations = () => {
  const navigate = useNavigate();
  const { profile, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/auth", { replace: true });
  }, [isLoading, isAuthenticated, navigate]);
  
  // Modal states
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showDownsell, setShowDownsell] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showQueueErrorModal, setShowQueueErrorModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  
  // Generation state
  const [generationType, setGenerationType] = useState<'video' | 'image'>('video');
  const [requiredCredits, setRequiredCredits] = useState(0);

  const handleGeneration = (model: Model, type: 'video' | 'image') => {
    const cost = type === 'video' ? VIDEO_COST : IMAGE_COST;
    
    setGenerationType(type);
    setRequiredCredits(cost);
    
    // Sempre inicia o carregamento primeiro (cria expectativa)
    setShowLoadingModal(true);
  };

  const handleLoadingComplete = () => {
    setShowLoadingModal(false);
    
    const cost = generationType === 'video' ? VIDEO_COST : IMAGE_COST;
    const currentCredits = profile?.credits || 0;
    
    // Após o loading, verifica créditos
    if (currentCredits < cost) {
      // Não tem créditos: mostra modal de créditos insuficientes
      setShowCreditsModal(true);
    } else {
      // Tem créditos: mostra erro de fila
      setShowQueueErrorModal(true);
    }
  };

  const handleBuyCredits = () => {
    setShowCreditsModal(false);
    // Abre o modal de planos diretamente na página
    setShowPlansModal(true);
  };

  // Saiu do modal de planos sem comprar → oferta relâmpago (ilimitado por R$ 9,90)
  const handleCreditsClose = () => {
    setShowCreditsModal(false);
    setTimeout(() => setShowDownsell(true), 300);
  };

  const handleAcceptDownsell = (plan: { id: string; name: string; amountCents: number; credits: number; isLifetime: boolean; isPremium: boolean }) => {
    initTikTokPixel();
    trackAddToCart({ content_name: plan.name, value: plan.amountCents / 100, currency: "BRL" });

    const params = new URLSearchParams({
      plan: plan.id,
      name: plan.name,
      amount: plan.amountCents.toString(),
      credits: plan.credits.toString(),
      isLifetime: plan.isLifetime ? "true" : "false",
      isPremium: plan.isPremium ? "true" : "false",
    });
    const utm = getStoredUtmParams();
    if (utm) {
      Object.entries(utm).forEach(([k, v]) => {
        if (v) params.set(k, v as string);
      });
    }

    trackInitiateCheckout({ content_name: plan.name, value: plan.amountCents / 100, currency: "BRL" });
    window.location.assign(`/checkout?${params.toString()}`);
  };

  return (
    <>
      {/* Modals */}
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={handleCreditsClose}
        onBuyCredits={handleBuyCredits}
        currentCredits={profile?.credits || 0}
        requiredCredits={requiredCredits}
        mediaType={generationType === "video" ? "video" : "photo"}
      />

      <ExitDownsellModal
        isOpen={showDownsell}
        onClose={() => setShowDownsell(false)}
        onAccept={handleAcceptDownsell}
      />
      
      <FastGenLoadingModal
        isOpen={showLoadingModal}
        onComplete={handleLoadingComplete}
        generationType={generationType}
      />
      
      <QueueErrorModal
        isOpen={showQueueErrorModal}
        onClose={() => setShowQueueErrorModal(false)}
      />

      <CreditsModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
      />

      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[100px]" />
        </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-primary" />
              Gerações Rápidas
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Escolha uma de nossas modelos e gere imagens incríveis em segundos
            </p>
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <div
              key={model.id}
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900/80 to-black/80 border border-white/10 hover:border-primary/40 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  loading="lazy"
                  decoding="async"
                  src={model.imageUrl}
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Name */}
                <h3 className="text-white font-bold text-lg leading-tight">
                  {model.name}
                  {model.subtitle && (
                    <span className="text-white/60 font-normal text-sm block">
                      ({model.subtitle})
                    </span>
                  )}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                  {model.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Generation section */}
                <div className="space-y-2">
                  <p className="text-white/40 text-xs font-medium">Estilos disponíveis:</p>
                  
                  {/* Video Button */}
                  <Button
                    onClick={() => handleGeneration(model, 'video')}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Vídeo Pelada (100 Créditos)
                  </Button>

                  {/* Image Button */}
                  <Button
                    onClick={() => handleGeneration(model, 'image')}
                    className="w-full h-10 rounded-xl bg-transparent border-2 border-primary/60 hover:bg-primary/20 text-primary hover:text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Imagem Pelada (100 Créditos)
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default FastGenerations;
