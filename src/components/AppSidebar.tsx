import { Camera, Crown, LayoutDashboard, Shield, Trash2, User, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCredits: () => void;
  onOpenAccount?: () => void;
  onOpenPhotoGeneration?: () => void;
  onOpenPremiumContent?: () => void;
  onOpenDeleteAccount?: () => void;
  isPremium?: boolean;
}

export default function AppSidebar({ isOpen, onClose, onOpenCredits, onOpenAccount, onOpenPhotoGeneration, onOpenPremiumContent, onOpenDeleteAccount, isPremium = false }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const links = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Gerações rápidas", icon: Zap, path: "/fast-generations" },
    { label: "Política de privacidade", icon: Shield, path: "/politic" },
    { label: "Termos de uso", icon: Shield, path: "/terms" },
  ];
  const run = (action: () => void) => { onClose(); action(); };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent id="dashboard-navigation" className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-[min(20rem,calc(100vw-2rem))] max-w-[20rem] sm:w-[20rem] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-l-0 bg-card p-5 sm:rounded-none">
        <DialogTitle className="pr-12 text-xl font-bold">Magnetize</DialogTitle>
        <DialogDescription className="mb-6 mt-2 text-sm">Menu de navegação</DialogDescription>
        <nav aria-label="Navegação da dashboard" className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          <Button type="button" onClick={() => run(onOpenCredits)} className="mb-3 h-12 w-full justify-start gap-3 rounded-xl"><Crown className="h-4 w-4" />Ver planos</Button>
          {links.map(({ label, icon: Icon, path }) => <button key={path} type="button" aria-current={location.pathname === path ? "page" : undefined} onClick={() => run(() => navigate(path))} className="flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"><Icon className="h-4 w-4 shrink-0" />{label}</button>)}
          {onOpenAccount && <Button type="button" variant="ghost" onClick={() => run(onOpenAccount)} className="h-12 w-full justify-start gap-3 rounded-xl"><User className="h-4 w-4" />Minha conta</Button>}
          {onOpenPhotoGeneration && <Button type="button" variant="ghost" onClick={() => run(onOpenPhotoGeneration)} className="h-12 w-full justify-start gap-3 rounded-xl"><Camera className="h-4 w-4" />Gerar com fotos</Button>}
          {onOpenPremiumContent && <Button type="button" variant="ghost" onClick={() => run(onOpenPremiumContent)} className="h-12 w-full justify-start gap-3 rounded-xl"><Crown className="h-4 w-4" />Conteúdo premium</Button>}
          {onOpenDeleteAccount && <Button type="button" variant="ghost" onClick={() => run(onOpenDeleteAccount)} className="h-12 w-full justify-start gap-3 rounded-xl"><Trash2 className="h-4 w-4" />Apagar conta</Button>}
        </nav>
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">{isPremium ? "Seu acesso: Premium" : "Conheça os planos disponíveis"}</p>
      </DialogContent>
    </Dialog>
  );
}
