import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callAccessApi } from "@/hooks/useAuth";
import { clearPendingCheckout, readPendingCheckout, type PendingCheckout } from "@/lib/pendingCheckout";

export default function PendingCheckoutNotice({ userId }: { userId?: string }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingCheckout | null>(null);

  useEffect(() => {
    setPending(null);
    if (!userId) return;
    let active = true;
    const check = async () => {
      const saved = readPendingCheckout(userId);
      if (!saved) { if (active) setPending(null); return; }
      const result = await callAccessApi({ action: "transaction-status", transactionId: saved.transactionId });
      if (!active) return;
      if (result.success && result.status === "waiting_payment") {
        setPending(readPendingCheckout(userId));
      } else if (result.success) {
        clearPendingCheckout();
        setPending(null);
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [userId]);

  if (!pending) return null;
  return (
    <section aria-label="Pagamento pendente" className="mb-6 flex flex-col gap-3 border-y border-primary/30 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-foreground">Seu pagamento ainda está pendente</p>
          <p className="text-sm text-muted-foreground">{(pending.amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        </div>
      </div>
      <Button onClick={() => {
        if (!userId) return;
        const current = readPendingCheckout(userId);
        if (current) navigate(current.path);
        else setPending(null);
      }} className="shrink-0 gap-2">Continuar pagamento<ArrowRight className="h-4 w-4" /></Button>
    </section>
  );
}