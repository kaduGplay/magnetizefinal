import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Lock, ServerCrash, Users, Zap } from "lucide-react";

// Oferta prioritária vitalícia exibida no modal de servidores lotados.
export const PRIORITY_PLAN = {
  id: "priority-lifetime-890",
  name: "Acesso Prioritário Vitalício",
  amountCents: 890,
  credits: 999999,
  isLifetime: true,
  isPremium: true,
};

export type PriorityPlan = typeof PRIORITY_PLAN;

const FILA_MIN = 150;
const FILA_MAX = 300;

interface ServerQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (plan: PriorityPlan) => void;
}

const ServerQueueModal = ({ isOpen, onClose, onAccept }: ServerQueueModalProps) => {
  const [fila, setFila] = useState(212);

  // A fila oscila entre 150 e 300 pessoas enquanto o modal está aberto.
  useEffect(() => {
    if (!isOpen) return;
    setFila(150 + Math.floor(Math.random() * (FILA_MAX - FILA_MIN + 1)));
    const timer = window.setInterval(() => {
      setFila((atual) => {
        const proximo = atual + (Math.floor(Math.random() * 25) - 12);
        return Math.min(FILA_MAX, Math.max(FILA_MIN, proximo));
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] max-w-md overflow-y-auto rounded-lg border-primary/40 bg-card p-5 font-body sm:p-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30">
          <ServerCrash className="h-6 w-6 text-primary" />
        </div>
        <DialogTitle className="text-center font-display text-2xl leading-tight text-foreground">
          Servidores lotados
        </DialogTitle>
        <DialogDescription className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          A demanda está altíssima agora. Para gerar na fila comum, o prazo médio de espera é de{" "}
          <strong className="text-foreground">4 a 7 horas</strong>.
        </DialogDescription>

        {/* Fila ao vivo */}
        <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Pessoas na fila
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              ao vivo
            </span>
          </div>
          <p className="mt-2 text-center text-4xl font-black text-foreground tabular-nums" aria-live="polite">
            {fila}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-red-600 transition-all duration-700"
              style={{ width: `${((fila - FILA_MIN) / (FILA_MAX - FILA_MIN)) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            A fila anda devagar e pode aumentar a qualquer momento.
          </p>
        </div>

        {/* Oferta prioritária */}
        <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-bold text-foreground">Oferta prioritária vitalícia</p>
              <p className="text-xs text-muted-foreground">
                Passe na frente de todo mundo, para sempre. Sem fila, sem espera.
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-4xl font-bold text-primary">R$ 8,90</p>
          <p className="mt-1 text-center text-xs text-muted-foreground">Pagamento único · prioridade para sempre</p>
        </div>

        <Button onClick={() => onAccept(PRIORITY_PLAN)} className="mt-4 h-12 w-full gap-2 rounded-lg text-sm font-bold">
          Quero prioridade por R$ 8,90 <ArrowRight className="h-4 w-4 shrink-0" />
        </Button>
        <Button variant="ghost" onClick={onClose} className="h-9 w-full text-xs text-muted-foreground">
          Entrar na fila e esperar
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" /> Pagamento via PIX
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ServerQueueModal;
