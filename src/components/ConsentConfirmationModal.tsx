import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface ConsentConfirmationModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onConfirm: () => void;
  alwaysConfirmPhoto?: boolean;
}

const ConsentConfirmationModal = ({
  isOpen,
  imageUrl,
  onClose,
  onConfirm,
  alwaysConfirmPhoto = false,
}: ConsentConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[94dvh] overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>{alwaysConfirmPhoto ? "Usar esta foto?" : "Confirme antes de enviar"}</DialogTitle>
            <DialogDescription className="mt-2">
              Confira se esta é a foto certa antes de começar.
            </DialogDescription>
          </div>

          {imageUrl && (
            <div className="flex max-h-[48dvh] min-h-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-2">
              <img src={imageUrl} alt="Foto escolhida" className="max-h-[46dvh] w-full rounded-lg object-contain" />
            </div>
          )}

          <Button className="h-12 w-full font-bold" onClick={onConfirm}>
            {alwaysConfirmPhoto ? "Gerar com essa foto" : "Confirmar e continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentConfirmationModal;
