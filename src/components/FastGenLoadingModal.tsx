import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { Check, Loader2, Sparkles } from "lucide-react";


interface FastGenLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  generationType: 'video' | 'image';
}

const videoSteps = [
  "Preparando modelo... 🎬",
  "Analisando características...",
  "Removendo roupas... 🔥",
  "Gerando áudio realista... 🎙️",
  "Aplicando movimentos sensuais... 💃",
  "Renderizando vídeo... 🎥",
  "Finalizando geração... ✨"
];

const imageSteps = [
  "Preparando modelo... 📸",
  "Analisando características...",
  "Removendo roupas... 🔥",
  "Ajustando iluminação... 💡",
  "Aplicando filtros sensuais... ✨",
  "Renderizando imagem... 🖼️",
  "Finalizando geração... 🎨"
];

const LOADING_DURATION = 10000; // 10 segundos

const FastGenLoadingModal = ({
  isOpen,
  onComplete,
  generationType,
}: FastGenLoadingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useLockBodyScroll(isOpen);

  const steps = generationType === 'video' ? videoSteps : imageSteps;
  const stepsCount = steps.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    setCurrentStep(0);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 98 ? 98 : prev + 1));
    }, LOADING_DURATION / 100);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev >= stepsCount - 1 ? prev : prev + 1));
    }, LOADING_DURATION / stepsCount);

    const completeTimer = setTimeout(() => {
      setProgress(100);
      onCompleteRef.current();
    }, LOADING_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepTimer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, stepsCount]);


  if (!isOpen) return null;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return createPortal(
    <div className="pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
    <div className="relative flex h-[85dvh] max-h-[640px] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-background touch-pan-y">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-red-600/20 blur-[110px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={radius} className="stroke-white/10" strokeWidth="6" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#fastGenGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              className="transition-all duration-200 ease-out"
            />
            <defs>
              <linearGradient id="fastGenGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold tabular-nums text-foreground sm:text-4xl">
              {Math.round(progress)}%
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {generationType === 'video' ? 'vídeo' : 'imagem'}
            </span>
          </div>
        </div>

        <div className="max-w-sm space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            Geração rápida
          </div>
          <h2 className="text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
            Gerando seu {generationType === 'video' ? 'vídeo' : 'imagem'} 🔞
          </h2>
          <p className="text-sm text-primary/90 animate-pulse">{steps[currentStep]}</p>
        </div>

        <div className="w-full max-w-sm space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center gap-3 text-xs transition-all duration-300 sm:text-sm ${
                index < currentStep
                  ? "text-muted-foreground"
                  : index === currentStep
                    ? "text-foreground"
                    : "text-muted-foreground/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  index < currentStep
                    ? "border-primary/40 bg-primary/20 text-primary"
                    : index === currentStep
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : index === currentStep ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
              </span>
              <span className="truncate">{step}</span>
            </div>
          ))}
        </div>

        <p className="max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground">
          Não feche esta tela. Tudo é processado de forma anônima.
        </p>
      </div>
    </div>
    </div>,
    document.body,
  );
};

export default FastGenLoadingModal;
