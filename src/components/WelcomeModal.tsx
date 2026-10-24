import { Button } from "@/components/ui/button";
import { Sparkles, ArrowDown, X, Wand2, Star } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToTemplates: () => void;
}

const WelcomeModal = ({ isOpen, onClose, onGoToTemplates }: WelcomeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-xl p-3 py-6 sm:p-4">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/25 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-500/20 rounded-full blur-[100px] animate-pulse delay-300" />
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-orange-500/15 rounded-full blur-[80px] animate-pulse delay-500" />
      </div>

      <div className="relative bg-gradient-to-b from-zinc-900/95 to-black/95 border-2 border-primary/30 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 max-w-lg w-full my-auto text-center shadow-2xl shadow-primary/20 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Glow border effect */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-primary via-red-500 to-orange-500 opacity-15 blur-xl -z-10" />
        
        {/* Celebration icons */}
        <div className="flex justify-center gap-3 mb-4">
          <Star className="h-6 w-6 text-amber-400 animate-pulse" />
          <Sparkles className="h-7 w-7 text-primary animate-pulse delay-100" />
          <Star className="h-6 w-6 text-amber-400 animate-pulse delay-200" />
        </div>

        {/* Icon with glow */}
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-red-500 blur-3xl opacity-50 rounded-full animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-primary/50">
            <Wand2 className="h-12 w-12 text-white" />
          </div>
        </div>
        
        {/* Title with gradient */}
        <h2 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Bem-vindo! 🎉
        </h2>
        
        <p className="text-lg text-muted-foreground mb-2">
          Sua conta anônima foi criada com sucesso!
        </p>

        <p className="text-base text-muted-foreground/80 mb-8">
          Gere seu primeiro <span className="text-primary font-bold">vídeo quente</span> agora mesmo 🔞
        </p>

        {/* CTA Button */}
        <Button 
          className="w-full h-16 rounded-2xl text-lg font-bold bg-gradient-to-r from-primary via-red-500 to-orange-500 hover:from-primary/90 hover:via-red-500/90 hover:to-orange-500/90 text-white shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:scale-[1.02] transition-all duration-300 group mb-4"
          onClick={onGoToTemplates}
        >
          <ArrowDown className="h-5 w-5 mr-2 group-hover:translate-y-1 transition-transform" />
          VER TEMPLATES DE GERAÇÃO
        </Button>

        {/* Dismiss link */}
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Dispensar e explorar sozinho
        </button>

        {/* Feature badges */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>+50 Templates</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Vídeos & Imagens</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>100% Anônimo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
