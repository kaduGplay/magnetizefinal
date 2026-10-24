import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Download,
  Globe,
  MoreVertical,
  Plus,
  Share2,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "magnetize_install_banner_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Device = "ios" | "android" | "desktop";

const getDevice = (): Device => {
  const userAgent = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIos) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
};

const deviceContent: Record<Device, {
  label: string;
  title: string;
  steps: Array<{ icon: typeof Share2; text: string; detail: string }>;
}> = {
  ios: {
    label: "iPhone / iPad",
    title: "Instale pelo Safari",
    steps: [
      {
        icon: Share2,
        text: "Abra o menu Compartilhar",
        detail: "Toque no ícone de compartilhar na barra do Safari.",
      },
      {
        icon: Plus,
        text: "Adicione à Tela de Início",
        detail: "Role as opções, toque em “Adicionar à Tela de Início” e confirme.",
      },
      {
        icon: Check,
        text: "Pronto: abra como um aplicativo",
        detail: "O ícone do Magnetize ficará junto dos seus outros aplicativos.",
      },
    ],
  },
  android: {
    label: "Android",
    title: "Instale pelo navegador",
    steps: [
      {
        icon: MoreVertical,
        text: "Abra o menu do navegador",
        detail: "Toque nos três pontos no canto superior da tela.",
      },
      {
        icon: Download,
        text: "Toque em Instalar aplicativo",
        detail: "Escolha “Instalar aplicativo” ou “Adicionar à tela inicial”.",
      },
      {
        icon: Check,
        text: "Confirme a instalação",
        detail: "Aceite o aviso e encontre o Magnetize na sua tela inicial.",
      },
    ],
  },
  desktop: {
    label: "Computador",
    title: "Instale no Chrome ou Edge",
    steps: [
      {
        icon: Download,
        text: "Clique no botão Instalar",
        detail: "Ele pode aparecer na barra de endereço ou logo abaixo neste aviso.",
      },
      {
        icon: Globe,
        text: "Escolha Instalar",
        detail: "Confirme quando o navegador perguntar se deseja instalar o aplicativo.",
      },
      {
        icon: Check,
        text: "Acesse quando quiser",
        detail: "O Magnetize ganhará uma janela própria e um atalho no computador.",
      },
    ],
  },
};

const InstallAppBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const device = useMemo<Device>(() => {
    if (typeof window === "undefined") return "desktop";
    return getDevice();
  }, []);
  const guide = deviceContent[device];

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    setVisible(true);

    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!promptEvent) {
      setShowGuide(true);
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === "accepted") dismiss();
  };

  if (!visible) return null;

  return (
    <section className="sticky top-0 z-40 border-b border-primary/25 bg-background/95 shadow-md shadow-background/20 backdrop-blur-xl" aria-label="Baixe o aplicativo Magnetize">
      <div className="container px-2.5 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20 sm:h-9 sm:w-9">
            <Smartphone className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-xs font-bold text-foreground sm:text-sm">Baixe o Magnetize</p>
              <span className="hidden shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary sm:inline-flex">
                Acesso imediato
              </span>
            </div>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">Acesse mais rápido pela sua tela inicial.</p>
          </div>

          <Button
            type="button"
            onClick={install}
            className="h-8 shrink-0 rounded-lg bg-primary px-2.5 text-[11px] font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 sm:h-9 sm:px-3 sm:text-xs"
          >
            {promptEvent ? "Baixar aplicativo" : "Como instalar"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={dismiss}
            aria-label="Fechar aviso de instalação"
            className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowGuide((current) => !current)}
          aria-expanded={showGuide}
          aria-controls="install-guide"
          className="ml-10 mt-1 h-auto min-h-0 gap-1 px-0 py-0 text-[10px] font-semibold text-primary hover:bg-transparent hover:text-primary/80 sm:ml-12 sm:text-[11px]"
        >
          {showGuide ? "Ocultar instruções" : `Ver passo a passo para ${guide.label}`}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showGuide ? "rotate-180" : ""}`} aria-hidden="true" />
        </Button>

        {showGuide && (
          <div id="install-guide" className="mt-2 border-t border-border/60 pt-3" role="region" aria-label={`Passo a passo para ${guide.label}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Guia de instalação</p>
                <h2 className="mt-1 text-sm font-bold text-foreground">{guide.title}</h2>
              </div>
              <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                1 minuto
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {guide.steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.text} className="flex gap-3 rounded-xl border border-border/70 bg-card/70 p-3">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <StepIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-snug text-foreground">{step.text}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              Depois de instalado, o Magnetize abre em tela própria e fica sempre à mão na sua tela inicial.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InstallAppBanner;
