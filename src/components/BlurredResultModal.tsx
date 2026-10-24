import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import AutoplayVideo from "@/components/AutoplayVideo";

interface BlurredResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaSrc: string;
  isVideo?: boolean;
  onContinue: () => void;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  dismissLabel?: string;
}

const BlurredResultModal = ({
  isOpen,
  onClose,
  mediaSrc,
  isVideo = false,
  onContinue,
  title = "Seu conteúdo está pronto",
  subtitle = "Desbloqueie para ver sem censura em alta qualidade",
  ctaLabel = "Continuar para geração",
  dismissLabel = "Agora não",
}: BlurredResultModalProps) => {

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-b from-zinc-900 via-black to-zinc-950">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 px-4 py-6 sm:px-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3" />
              Resultado pronto
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>

          </div>

          {/* Blurred preview */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
            <div className="aspect-[3/4] max-h-[52dvh] w-full overflow-hidden">
              {isVideo ? (
                <AutoplayVideo
                  src={mediaSrc}
                  className="h-full w-full object-contain blur-2xl"
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt="Prévia do resultado gerado"
                  className="h-full w-full object-contain blur-2xl"
                />
              )}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
              <div className="rounded-full border border-primary/40 bg-black/70 p-4">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <p className="px-6 text-center text-sm font-semibold text-foreground">
                Conteúdo censurado
              </p>
              <p className="px-8 text-center text-xs text-muted-foreground">
                {isVideo ? "Vídeo gerado" : "Imagem gerada"} com sucesso ·{" "}
                {seconds}s
              </p>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent" />
          </div>

          <Button
            onClick={onContinue}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-primary to-red-600 text-base font-bold text-primary-foreground"
          >
            {ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {dismissLabel}

          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlurredResultModal;
