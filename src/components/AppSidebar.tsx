import {
  LayoutDashboard,
  Zap,
  Image,
  Camera,
  Crown,
  Coins,
  Gift,
  X,
  User,
  Shield,
  EyeOff,
  Lock,
  Sparkles,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCredits: () => void;
  onOpenAccount?: () => void;
  isPremium?: boolean;
  onOpenPhotoGeneration?: () => void;
  onOpenPremiumContent?: () => void;
  onOpenDeleteAccount?: () => void;
  credits?: number;
}

const AppSidebar = ({ isOpen, onClose, onOpenCredits, onOpenAccount, onOpenPhotoGeneration, onOpenPremiumContent, onOpenDeleteAccount, credits = 0 }: AppSidebarProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
      onClick: () => navigate("/dashboard")
    },
    {
      id: "geracoes-rapidas",
      label: "Gerações Rápidas",
      icon: Zap,
      isActive: pathname === "/fast-generations",
      badge: "NOVO",
      onClick: () => navigate("/fast-generations")
    },
    {
      id: "gerar-fotos",
      label: "Gerar com Fotos",
      icon: Camera,
      isActive: false,
      disabled: !onOpenPhotoGeneration,
      onClick: () => onOpenPhotoGeneration?.()
    },
    {
      id: "conteudo-premium",
      label: "Conteúdo Premium",
      icon: Crown,
      isActive: false,
      badge: "PRO",
      disabled: !onOpenPremiumContent,
      onClick: () => onOpenPremiumContent?.()
    },
    {
      id: "adquirir-creditos",
      label: "Adquirir Créditos",
      icon: Coins,
      isActive: false,
      onClick: () => onOpenCredits()
    },
    {
      id: "resgatar-creditos",
      label: "Resgatar Créditos",
      icon: Gift,
      isActive: false,
      disabled: true,
      onClick: () => {}
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent id="dashboard-navigation" className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-[min(20rem,calc(100vw-2rem))] max-w-[20rem] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-y-0 border-l-0 bg-zinc-950 p-0 sm:w-[20rem] sm:rounded-none sm:p-0">
        <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
        <DialogDescription className="sr-only">Páginas e opções de créditos da sua conta.</DialogDescription>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-900/95 via-black to-zinc-950/95" />
        <div className="relative flex h-full min-h-0 flex-col overflow-y-auto p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
                <img
                  src="https://xicnmhxqzlamsjwhpbzs.supabase.co/storage/v1/object/public/media/logo.jpeg"
                  alt="Magnetize A.I."
                  className="relative h-8 w-auto rounded-lg"
                />
              </div>
            </div>

          </div>

          {/* User Card */}
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 backdrop-blur-sm relative overflow-hidden group">
            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-xl shadow-primary/40">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base truncate">Usuário Anônimo</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Shield className="h-3 w-3 text-success" />
                  <p className="text-success text-xs font-medium">Modo Anônimo Ativo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-success/10 border border-success/20">
              <EyeOff className="h-3.5 w-3.5 text-success" />
              <span className="text-[10px] font-semibold text-success">ANÔNIMO</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-success/10 border border-success/20">
              <Lock className="h-3.5 w-3.5 text-success" />
              <span className="text-[10px] font-semibold text-success">SEGURO</span>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Navegação da dashboard" className="shrink-0 space-y-2 pb-5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  disabled={item.disabled}
                  aria-current={item.isActive ? "page" : undefined}
                  title={item.disabled ? "Indisponível" : undefined}
                  onClick={() => { onClose(); item.onClick(); }}
                  className={`disabled:cursor-not-allowed disabled:opacity-40 min-h-12 touch-manipulation w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                    item.isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {/* Active background */}
                  {item.isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-red-600 rounded-xl shadow-lg shadow-primary/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 rounded-xl" />
                    </>
                  )}

                  <IconComponent className={`relative h-5 w-5 flex-shrink-0 ${
                    item.isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                  }`} />
                  <span className="relative text-sm font-medium flex-1 text-left">{item.label}</span>

                  {item.disabled && <span className="relative text-[9px] text-white/50">Indisponível</span>}
                  {!item.disabled && item.badge && (
                    <span className={`relative text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge === "PRO"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {onOpenAccount && <Button type="button" variant="ghost" className="mb-4 min-h-12 w-full justify-start gap-3 rounded-xl" onClick={() => { onClose(); onOpenAccount(); }}><User className="h-4 w-4" />Minha conta</Button>}
          {/* Footer */}
          <div className="pt-6 border-t border-white/10">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 backdrop-blur-sm relative overflow-hidden">
              {/* Subtle animation */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                    <Coins className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-medium">Seus créditos</p>
                    <p className="text-white font-black text-2xl">{credits}</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    onOpenCredits();
                    onClose();
                  }}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] hover:bg-right text-white text-sm font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Adquirir Créditos
                </Button>
              </div>
            </div>

            {/* Security note */}
            <p className="text-center text-white/30 text-[10px] mt-4 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              Seus dados estão protegidos
            </p>

            {/* Discreet: Apagar Conta */}
            {onOpenDeleteAccount && (
              <button
                onClick={() => { onOpenDeleteAccount(); onClose(); }}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-white/30 hover:text-white/60 text-[11px] transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Apagar conta</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppSidebar;
