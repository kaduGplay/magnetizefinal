import { 
  LayoutDashboard, 
  Zap, 
  Image, 
  Camera, 
  Crown, 
  X,
  User,
  Shield,
  EyeOff,
  Lock,
  Sparkles,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCredits: () => void;
  onOpenPhotoGeneration?: () => void;
  onOpenPremiumContent?: () => void;
  onOpenDeleteAccount?: () => void;
  isPremium?: boolean;
}

const AppSidebar = ({ isOpen, onClose, onOpenCredits, onOpenPhotoGeneration, onOpenPremiumContent, onOpenDeleteAccount, isPremium = false }: AppSidebarProps) => {

  const navigate = useNavigate();
  
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard, 
      isActive: true,
      onClick: () => navigate("/dashboard")
    },
    { 
      id: "geracoes-rapidas", 
      label: "Gerações Rápidas", 
      icon: Zap, 
      isActive: false,
      badge: "NOVO",
      onClick: () => navigate("/fast-generations")
    },
    { 
      id: "gerar-fotos", 
      label: "Gerar com Fotos", 
      icon: Camera, 
      isActive: false,
      onClick: () => onOpenPhotoGeneration?.()
    },
    { 
      id: "conteudo-premium", 
      label: "Conteúdo Premium", 
      icon: Crown, 
      isActive: false,
      badge: "PRO",
      onClick: () => onOpenPremiumContent?.()
    },
    { 
      id: "adquirir-creditos", 
      label: "Planos", 
      icon: Crown, 
      isActive: false,
      onClick: () => onOpenCredits()
    },

  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 w-80 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Background with glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/95 via-black/98 to-zinc-950/95 backdrop-blur-xl" />
        
        {/* Glow effects */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
                <img 
                  src="/media/logo.jpeg"
                  alt="Magnetize"
                  className="relative h-8 w-auto rounded-lg"
                />
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>
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
                <h3 className="text-white font-bold text-base truncate">Acesso individual</h3>
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
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    if (item.id !== "adquirir-creditos") {
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
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
                  
                  {item.badge && (
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

          {/* Footer */}
          <div className="pt-6 border-t border-white/10">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 backdrop-blur-sm relative overflow-hidden">
              {/* Subtle animation */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs font-medium">Seu plano</p>
                    <p className="text-white font-black text-2xl">{isPremium ? "Vitalício" : "Básico"}</p>
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
                  {isPremium ? "Ver meu plano" : "Liberar Vitalício"}
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
      </aside>
    </>
  );
};

export default AppSidebar;
