import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { trackCompleteRegistration, trackLead } from "@/lib/facebook-pixel";
import { trackVirtualPageview } from "@/lib/funnel";
import AutoplayVideo from "@/components/AutoplayVideo";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onSuccess?: () => void;
  navigateOnSuccess?: boolean;
  generationPreviewUrl?: string | null;
  generationPreviewIsVideo?: boolean;
}

// Impede que duas instâncias do modal finalizem o mesmo fluxo ao mesmo tempo.
let lastFinishAt = 0;
const FINISH_DEDUPE_MS = 5000;

const CreateAccountModal = ({
  isOpen,
  onClose,
  onOpenLogin,
  onSuccess,
  navigateOnSuccess = true,
  generationPreviewUrl,
  generationPreviewIsVideo = false,
}: CreateAccountModalProps) => {
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { if (!isOpen) setShowPassword(false); }, [isOpen]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Proteções contra execuções duplicadas
  const finishExecutedRef = useRef(false);
  const submittingRef = useRef(false);

  // Cadastro por e-mail notifica aqui; Google/Apple notificam no useAuth.
  // Assim a mesma autenticação não gera duas notificações de sucesso.
  const finish = (source: "email" | "social" = "email") => {
    if (finishExecutedRef.current) return;
    finishExecutedRef.current = true;

    const now = Date.now();
    if (now - lastFinishAt < FINISH_DEDUPE_MS) return;
    lastFinishAt = now;

    if (source === "email") {
      toast.success("Conta criada, continue gerando", {
        id: "account-created",
        description: "Continue com o vídeo escolhido ou escolha outro na galeria.",
        icon: <PartyPopper className="h-5 w-5 text-primary" />,
        duration: 4000,
      });
    }

    onSuccess?.();
    onClose();

    if (navigateOnSuccess && window.location.pathname !== "/dashboard") {
      window.dispatchEvent(new CustomEvent("magnetize:navigate", { detail: "/dashboard" }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Evita múltiplas requisições simultâneas.
    if (submittingRef.current || finishExecutedRef.current || confirmationSent) {
      return;
    }

    setError("");

    if (fullName.trim().length < 2) {
      setError("Digite seu nome.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Digite um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    submittingRef.current = true;
    setIsLoading(true);

    try {
      const result = await signup(fullName.trim(), email.trim(), password);

      if (result.error) {
        trackVirtualPageview("/erro-criar-conta");

        const errorMessage = result.error.message || "";

        if (
          errorMessage.toLowerCase().includes("já está cadastrado") ||
          errorMessage.toLowerCase().includes("already registered") ||
          errorMessage.toLowerCase().includes("already exists")
        ) {
          toast.info("Este e-mail já tem conta", {
            id: "account-already-exists",
            description: "É só entrar com sua senha para continuar.",
            duration: 4000,
          });

          onOpenLogin();
          return;
        }

        setError(errorMessage || "Erro ao criar conta.");
        return;
      }

      // Eventos de conversão são enviados após cadastro bem-sucedido.
      trackLead({
        content_name: "Signup",
      });

      trackCompleteRegistration({
        content_name: "Signup",
      });

      if (result.needsEmailConfirmation) {
        setConfirmationSent(true);
        return;
      }

      finish("email");
    } catch (err) {
      console.error("Erro ao criar conta:", err);

      setError("Não foi possível criar sua conta. Tente novamente.");
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background/90 p-3 backdrop-blur-xl sm:p-4">
      <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Fechar"
          className="pointer-events-auto absolute right-2 top-2 z-30 h-12 w-12 touch-manipulation rounded-full text-muted-foreground hover:bg-muted"
        >
          ✕
        </Button>

        {confirmationSent ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-black text-foreground">Confirme seu e-mail</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Enviamos um link para <strong className="text-foreground">{email}</strong>. Toque nele para liberar sua
              conta.
            </p>

            <Button
              type="button"
              className="mt-6 h-12 w-full rounded-xl"
              onClick={() => {
                setConfirmationSent(false);
                onOpenLogin();
              }}
            >
              Ir para entrar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-10 p-5 pt-6 sm:p-6">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <h1 className="text-2xl font-black text-foreground">
                {generationPreviewUrl ? "Seu resultado está pronto" : "Crie sua conta para continuar"}
              </h1>

              <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
                {generationPreviewUrl
                  ? "Crie sua conta para revelar o resultado e continuar criando."
                  : "Leva menos de 1 minuto e você continua de onde parou."}
              </p>
            </div>

            <div className="space-y-4">
              {generationPreviewUrl &&
                (generationPreviewIsVideo ? (
                  <AutoplayVideo
                    src={generationPreviewUrl}
                    className="mx-auto aspect-video w-full rounded-xl border border-border object-contain blur-xl"
                  />
                ) : (
                  <img
                    src={generationPreviewUrl}
                    alt="Prévia protegida do resultado"
                    className="mx-auto aspect-video w-full rounded-xl border border-border object-contain blur-xl"
                  />
                ))}

              <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-foreground">
                <EyeOff className="h-4 w-4 shrink-0 text-primary" />
                100% anônimo: seu perfil não aparece para ninguém
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 ml-1 block text-xs font-semibold text-muted-foreground">Nome ou apelido</span>

                  <input
                    aria-label="Seu nome ou apelido"
                    autoComplete="nickname"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Como podemos chamar você?"
                    className="h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 ml-1 block text-xs font-semibold text-muted-foreground">E-mail</span>

                  <input
                    aria-label="Seu e-mail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@email.com"
                    className="h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <div className="block">
                  <label htmlFor="create-account-password" className="mb-1.5 ml-1 block text-xs font-semibold text-muted-foreground">Senha</label>
                  <div className="relative">
                    <input
                    id="create-account-password"
                    aria-label="Crie uma senha"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="h-12 w-full rounded-xl border border-border bg-background/70 pl-4 pr-14 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-0 top-0 flex h-12 w-12 touch-manipulation items-center justify-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-center text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-14 w-full rounded-xl text-base font-bold shadow-lg shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta e continuar
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                Já tem uma conta?
                <Button type="button" variant="link" className="h-auto p-0 font-semibold" onClick={onOpenLogin}>
                  Entre aqui
                </Button>
              </div>

              <p className="px-4 text-center text-[11px] leading-relaxed text-foreground/75">
                Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateAccountModal;
