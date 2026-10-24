import { useState } from "react";
import { ArrowRight, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trackVirtualPageview } from "@/lib/funnel";

interface LoginCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew?: () => void;
  onSuccess?: () => void;
  navigateOnSuccess?: boolean;
}

const LoginCodeModal = ({ isOpen, onClose, onCreateNew, onSuccess, navigateOnSuccess = true }: LoginCodeModalProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const finish = () => {
    onSuccess?.();
    onClose();
    if (navigateOnSuccess) window.dispatchEvent(new CustomEvent("magnetize:navigate", { detail: "/dashboard" }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.error) {
      setError(result.error.message);
      trackVirtualPageview("/erro-entrar");
      return;
    }
    finish();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 p-3 backdrop-blur-xl sm:p-4">
      <form onSubmit={handleSubmit} className="relative my-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6">
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 rounded-full text-muted-foreground">✕</Button>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground"><LogIn className="h-7 w-7" /></div>
          <h1 className="text-2xl font-black text-foreground">Entrar na conta</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Continue criando suas fotos e vídeos.</p>
        </div>
        <div className="space-y-3">
          <label className="relative block"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input aria-label="E-mail" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Seu e-mail" className="h-14 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-foreground outline-none focus:border-primary" required /></label>
          <label className="relative block"><Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input aria-label="Senha" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" className="h-14 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-foreground outline-none focus:border-primary" required /></label>
        </div>
        {error && <p role="alert" className="mt-3 text-center text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-5 h-14 w-full rounded-xl text-base font-bold" disabled={isLoading}>{isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />Entrando...</> : <>Entrar e gerar<ArrowRight className="h-5 w-5" /></>}</Button>
        {onCreateNew && <Button type="button" variant="ghost" className="mt-2 h-auto w-full py-3 text-sm font-semibold text-primary" onClick={onCreateNew}>Ainda não tenho conta — Criar conta</Button>}
      </form>
    </div>
  );
};

export default LoginCodeModal;