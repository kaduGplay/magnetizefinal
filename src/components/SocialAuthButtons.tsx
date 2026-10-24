import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { trackVirtualPageview } from "@/lib/funnel";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1A6.2 6.2 0 1 1 16.1 7.4l2.7-2.6A9.8 9.8 0 1 0 12 21.8c5.66 0 9.4-3.98 9.4-9.58 0-.64-.07-1.13-.17-2.02H12Z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M16.36 12.9c.02 2.62 2.3 3.49 2.33 3.5-.02.06-.36 1.23-1.2 2.44-.72 1.04-1.47 2.08-2.65 2.1-1.16.02-1.53-.68-2.86-.68-1.32 0-1.74.66-2.84.7-1.13.04-1.99-1.11-2.72-2.15-1.5-2.16-2.65-6.11-1.1-8.78.76-1.33 2.13-2.16 3.61-2.19 1.13-.02 2.19.75 2.87.75.68 0 1.98-.93 3.33-.79.57.02 2.17.2 3.2 1.56-.08.05-1.91 1.1-1.89 3.28M14.2 4.9c.6-.72 1-1.72.89-2.72-.87.04-1.93.58-2.55 1.3-.56.64-1.03 1.66-.9 2.64.97.08 1.95-.49 2.56-1.22" />
  </svg>
);

interface SocialAuthButtonsProps { onDone?: () => void }

const SocialAuthButtons = ({ onDone }: SocialAuthButtonsProps) => {
  const { signInWithProvider } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<"google" | "apple" | null>(null);

  const handleProvider = async (provider: "google" | "apple") => {
    setPending(provider);
    const result = await signInWithProvider(provider);
    if (result.redirected) return;
    setPending(null);
    if (result.error) {
      trackVirtualPageview(`/erro-login-${provider}`);
      toast({ title: "Não foi possível entrar", description: result.error.message, variant: "destructive" });
      return;
    }
    onDone?.();
  };

  return (
    <div className="space-y-2.5">
      <Button type="button" variant="secondary" className="h-14 w-full rounded-xl bg-foreground text-base font-bold text-background hover:bg-foreground/90" disabled={Boolean(pending)} onClick={() => void handleProvider("google")}>
        {pending === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
        Continuar com Google
      </Button>
      <Button type="button" variant="outline" className="h-14 w-full rounded-xl border-border bg-background text-base font-bold text-foreground hover:bg-muted" disabled={Boolean(pending)} onClick={() => void handleProvider("apple")}>
        {pending === "apple" ? <Loader2 className="h-5 w-5 animate-spin" /> : <AppleIcon />}
        Continuar com Apple
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
