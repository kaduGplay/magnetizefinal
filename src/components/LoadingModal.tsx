import { RefreshCw } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

const LoadingModal = ({ isOpen, message = "GERANDO IMAGEM" }: LoadingModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center">
          <RefreshCw className="w-10 h-10 text-primary-foreground animate-spin" />
        </div>
        <p className="text-primary font-semibold text-lg animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
