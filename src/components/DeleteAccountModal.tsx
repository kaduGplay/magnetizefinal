import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { callAccessApi, getAccessToken, useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "confirm" | "paying" | "pix" | "done";

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const navigate = useNavigate();
  const { profile, deleteAccount } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("confirm");
  const [pixCode, setPixCode] = useState<string>("");
  const [pixTxId, setPixTxId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      setPixCode("");
      setPixTxId("");
      setError("");
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, [isOpen]);

  const startPayment = async () => {
    if (!profile) return;
    setStep("paying");
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke("create-pix-payment", {
        headers: { "x-access-token": getAccessToken() || "" },
        body: {
          planId: "account_deletion",
          planName: "Apagar Conta",
          amount: 1490,
          customerName: profile.full_name,
          customerEmail: profile.email || undefined,
          customerPhone: (profile.phone || "").replace(/\D/g, "").slice(-11),
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || "Erro ao gerar PIX");
      }

      setPixCode(data.pixQrcode || "");
      setPixTxId(data.transactionId);
      setStep("pix");

      pollRef.current = window.setInterval(async () => {
        const tx = await callAccessApi({ action: "transaction-status", transactionId: data.transactionId });
        if (tx.status === "paid") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          const { error: delErr } = await deleteAccount(data.transactionId);
          if (delErr) {
            setError(delErr.message);
            return;
          }
          setStep("done");
          toast({ title: "Conta apagada", description: "Sua conta foi removida com sucesso." });
          setTimeout(() => {
            onClose();
            navigate("/");
          }, 1500);
        }
      }, 3000);
    } catch (e) {
      setStep("confirm");
      setError(e instanceof Error ? e.message : "Erro ao gerar PIX");
    }
  };

  const copyPix = async () => {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
      <div className="relative bg-gradient-to-b from-zinc-900/95 to-black/95 border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
        >✕</button>

        {step === "confirm" && (
          <>
            <div className="text-center mb-6">
              <div className="relative inline-flex mb-4">
                <div className="absolute inset-0 bg-red-500/40 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Apagar conta</h3>
              <p className="text-white/60 text-sm">
                Esta ação é irreversível. Todos os seus dados, créditos e histórico serão removidos.
              </p>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 mb-6 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200/90">
                Para prosseguir, é cobrada uma taxa de processamento de{" "}
                <strong className="text-white">R$ 14,90</strong> via PIX.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center mb-3">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 border-white/10 text-white hover:bg-white/5"
                onClick={onClose}
              >Cancelar</Button>
              <Button
                className="h-12 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold"
                onClick={startPayment}
              >Pagar R$ 14,90</Button>
            </div>
          </>
        )}

        {step === "paying" && (
          <div className="text-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-white/80">Gerando PIX...</p>
          </div>
        )}

        {step === "pix" && (
          <>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-1">Pague para confirmar</h3>
              <p className="text-white/60 text-sm">Aguardando pagamento...</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
              <p className="text-xs text-white/50 mb-2">PIX Copia e Cola</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-white/80 break-all font-mono">
                  {pixCode.slice(0, 60)}...
                </code>
                <button
                  onClick={copyPix}
                  className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando pagamento...</span>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-white font-bold">Conta apagada com sucesso.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;