import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Infinity as InfinityIcon, Lock } from "lucide-react";

export const DOWNSELL_PLAN = {
  id: "lifetime-downsell-990",
  name: "Acesso Ilimitado (Oferta Relâmpago)",
  amountCents: 990,
  credits: 999999,
  isLifetime: true,
  isPremium: true,
};

export type DownsellPlan = typeof DOWNSELL_PLAN;

interface ExitDownsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (plan: DownsellPlan) => void;
}

const ExitDownsellModal = ({ isOpen, onClose, onAccept }: ExitDownsellModalProps) => (
  <Dialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] max-w-md overflow-y-auto rounded-lg border-primary/40 bg-card p-5 font-body sm:p-6">
      <p className="pr-8 text-xs font-bold text-primary">Uma oferta antes de sair</p>
      <DialogTitle className="font-display text-2xl leading-tight text-foreground">
        Vídeos e fotos ilimitados
      </DialogTitle>
      <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
        Continue criando quantas vezes quiser com acesso vitalício. Um único pagamento, sem mensalidade.
      </DialogDescription>
      <div className="flex items-center gap-3 border-y border-border py-4">
        <InfinityIcon className="h-8 w-8 shrink-0 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">
            De <span className="line-through">R$ 14,90</span> por
          </p>
          <p className="mt-1 text-4xl font-bold text-primary">R$ 9,90</p>
          <p className="mt-1 text-xs text-muted-foreground">Pagamento único · acesso para sempre</p>
        </div>
      </div>
      <Button onClick={() => onAccept(DOWNSELL_PLAN)} className="h-12 w-full gap-2 rounded-lg text-sm font-bold">
        Quero ilimitado por R$ 9,90 <ArrowRight className="h-4 w-4 shrink-0" />
      </Button>
      <Button variant="ghost" onClick={onClose} className="h-9 w-full text-xs text-muted-foreground">
        Agora não, voltar aos vídeos
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3" /> Pagamento via PIX
      </p>
    </DialogContent>
  </Dialog>
);

export default ExitDownsellModal;
