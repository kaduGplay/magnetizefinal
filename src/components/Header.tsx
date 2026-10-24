import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface HeaderProps {
  onAccessAccount: () => void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
}

const Header = ({ onAccessAccount, isAuthenticated = false, isLoading = false }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-border/50" />
      <div className="container relative flex items-center justify-between h-14 md:h-18">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <img 
              src="/media/logo.jpeg" 
              alt="Magnetize" 
              className="relative h-9 w-auto rounded-lg"
            />
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-foreground">
            Magnetize
          </span>
        </div>

        
        <Button 
          size="sm" 
          className="gap-1.5 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 active:scale-95 rounded-xl px-4 h-9 text-xs sm:text-sm"
          onClick={onAccessAccount}
          disabled={isLoading}
          aria-label="Minha conta"
        >
          <LogIn className="w-3.5 h-3.5" />
          {isAuthenticated ? "Minha conta" : "Entrar"}
        </Button>
      </div>
    </header>
  );
};

export default Header;
