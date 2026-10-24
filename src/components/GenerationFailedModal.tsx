import { XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GenerationFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GenerationFailedModal = ({
  isOpen,
  onClose,
}: GenerationFailedModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-gradient-to-b from-zinc-900 to-black border-white/10 p-0 gap-0 overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/30 blur-3xl rounded-full animate-pulse" />
              <div className="relative p-5 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 border-2 border-red-500/50">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-white">
              Erro na Geração 😔
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Infelizmente ocorreu um erro durante o processamento da sua geração. 
              Os servidores estavam muito sobrecarregados.
            </p>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-white/80 font-medium">Seus créditos foram consumidos</p>
              <p className="text-white/50 text-xs mt-1">
                Devido à alta demanda, não foi possível completar a geração. 
                Considere adquirir o acesso prioritário para evitar filas.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/70 text-xs font-medium">💡 Dicas para próxima tentativa:</p>
            <ul className="text-white/50 text-xs space-y-1 ml-4 list-disc">
              <li>Tente novamente em alguns minutos</li>
              <li>Evite horários de pico (18h-22h)</li>
              <li>Adquira acesso prioritário para geração instantânea</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={onClose}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 text-white text-base font-bold shadow-lg shadow-primary/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Entendido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerationFailedModal;
