import { Camera, Coins, Crown, EyeOff, Gift, LayoutDashboard, Lock, Shield, User, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCredits: () => void;
  onOpenAccount?: () => void;
  credits?: number;
  isPremium?: boolean;
}

export default function AppSidebar({ isOpen, onClose, onOpenCredits, onOpenAccount, credits = 0, isPremium = false }: AppSidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const secureConnection = window.location.protocol === "https:";
  const run = (action: () => void) => { onClose(); action(); };
  const links = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Gerações Rápidas", icon: Zap, path: "/fast-generations" },
  ];
  const unavailable = [
    { label: "Gerar com Fotos", icon: Camera },
    { label: "Conteúdo Premium", icon: Crown },
    { label: "Resgatar Créditos", icon: Gift },
  ];
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent id="dashboard-navigation" className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-[min(20rem,calc(100vw-2rem))] max-w-[20rem] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-l-0 bg-card p-5 sm:w-[20rem] sm:rounded-none">
        <DialogTitle className="pr-12 text-xl font-bold">Magnetize</DialogTitle>
        <DialogDescription className="mb-5 mt-2 text-sm">Menu de navegação</DialogDescription>
        <section aria-label="Privacidade da conta" className="mb-5 rounded-xl border border-border bg-muted/25 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><User className="h-4 w-4 text-primary" />Seu acesso individual</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Seu perfil não é exibido aos outros visitantes.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary"><EyeOff className="h-3 w-3" />Perfil privado</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground"><Lock className="h-3 w-3" />{secureConnection ? "Conexão HTTPS" : "Pagamento via PIX"}</span>
          </div>
        </section>
        <nav aria-label="Navegação da dashboard" className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {links.map(({ label, icon: Icon, path }) => <button key={path} type="button" aria-current={pathname === path ? "page" : undefined} onClick={() => run(() => navigate(path))} className="flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"><Icon className="h-4 w-4 shrink-0" />{label}</button>)}
          <Button type="button" variant="ghost" onClick={() => run(onOpenCredits)} className="h-12 w-full justify-start gap-3 rounded-xl"><Coins className="h-4 w-4" />Adquirir Créditos</Button>
          {unavailable.map(({ label, icon: Icon }) => <button key={label} type="button" disabled aria-label={label} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground opacity-50"><Icon className="h-4 w-4 shrink-0" /><span className="flex-1">{label}</span><span className="text-[9px]">Indisponível</span></button>)}
          {onOpenAccount && <Button type="button" variant="ghost" onClick={() => run(onOpenAccount)} className="h-12 w-full justify-start gap-3 rounded-xl"><User className="h-4 w-4" />Minha conta</Button>}
          <button type="button" onClick={() => run(() => navigate("/politic"))} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs text-muted-foreground hover:bg-muted"><Shield className="h-4 w-4" />Política de privacidade</button>
        </nav>
        <div className="mt-4 shrink-0 rounded-xl border border-border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between"><p className="text-xs text-muted-foreground">Seus créditos</p><span className="font-semibold tabular-nums">{credits.toLocaleString("pt-BR")}</span></div>
          <Button type="button" onClick={() => run(onOpenCredits)} className="h-12 w-full rounded-xl"><Crown className="h-4 w-4" />Ver planos</Button>
          {isPremium && <p className="mt-2 text-center text-xs text-muted-foreground">Acesso Premium</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
