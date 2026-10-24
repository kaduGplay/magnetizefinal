import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { Check, Sparkles } from "lucide-react";

interface GenerationLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  durationMs?: number;
}

const loadingSteps = [
  "Preparando tudo para o seu resultado...",
  "Analisando cada detalhe da imagem...",
  "Realçando os detalhes que fazem a diferença...",
  "Construindo uma versão ainda mais envolvente...",
  "Quase pronto... só mais alguns ajustes...",
  "A surpresa está tomando forma... ✨",
];

const DEFAULT_DURATION = 15000;

const GenerationLoadingModal = ({ isOpen, onComplete, durationMs }: GenerationLoadingModalProps) => {
  const GENERATION_DURATION = durationMs ?? DEFAULT_DURATION;
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useLockBodyScroll(isOpen);
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
      setProgress((prev) => Math.min(prev + 1, 98));
    }, GENERATION_DURATION / 100);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, loadingSteps.length - 1));
    }, GENERATION_DURATION / loadingSteps.length);

    const completeTimeout = setTimeout(() => {
      setProgress(100);
      onCompleteRef.current();
    }, GENERATION_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(completeTimeout);
    };
  }, [isOpen, GENERATION_DURATION]);


  if (!isOpen) return null;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex h-[100dvh] w-screen flex-col overflow-hidden overscroll-none bg-background touch-pan-y">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-red-600/20 blur-[110px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        {/* Progress ring */}
        <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-white/10"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="url(#genGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              className="transition-all duration-200 ease-out"
            />
            <defs>
              <linearGradient id="genGradient" x1="0" y1="0" x2="1" y2="1">
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
              gerando
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="max-w-sm space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            Processando
          </div>
          <h2 className="text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
            Criando seu conteúdo
          </h2>
          <p className="text-sm text-primary/90 animate-pulse">
            {loadingSteps[currentStep]}
          </p>
        </div>

        {/* Steps */}
        <div className="w-full max-w-sm space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
          {loadingSteps.map((step, index) => (
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
                      ? "border-primary bg-primary/10"
                      : "border-white/10"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : index === currentStep ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                ) : null}
              </span>
              <span className="truncate">{step}</span>
            </div>
          ))}
        </div>

        <p className="max-w-xs text-center text-[11px] leading-relaxed text-muted-foreground">
          Não feche esta tela. O processo é 100% anônimo e privado.
        </p>
      </div>
    </div>,
    document.body,
  );
};

export default GenerationLoadingModal;
