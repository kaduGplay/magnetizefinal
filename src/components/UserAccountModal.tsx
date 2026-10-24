import {
  X,
  Coins,
  Crown,
  History,
  Copy,
  Check,
  Loader2,
  Package,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Mail,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { callAccessApi, useAuth } from "@/hooks/useAuth";
import DeleteAccountModal from "./DeleteAccountModal";

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCredits: () => void;
}

interface UserPlan {
  id: string;
  plan_id: string;
  plan_name: string;
  credits_purchased: number;
  amount_paid: number;
  is_lifetime: boolean;
  acquired_at: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const UserAccountModal = ({ isOpen, onClose, onOpenCredits }: UserAccountModalProps) => {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "history" | "refund">("overview");
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundSubmitted, setRefundSubmitted] = useState(false);
  const [showDelete, setShowDelete] = useState(false);


  useEffect(() => {
    if (isOpen && profile) {
      fetchUserData();
    }
  }, [isOpen, profile]);

  const fetchUserData = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const data = await callAccessApi({ action: "account-data" });
      setPlans((data.plans as UserPlan[]) || []);
      setTransactions((data.transactions as CreditTransaction[]) || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (profile?.access_code_last4) {
      await navigator.clipboard.writeText(`••••${profile.access_code_last4}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount: number) => {
    return (amount / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-3 sm:p-4">
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[88dvh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Minha conta
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(88dvh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-primary-foreground text-xl font-bold">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-semibold">{profile?.full_name || "Cliente Magnetize"}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{profile?.email || "Conta anterior vinculada"}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{profile?.credits || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Créditos</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Crown
                        className={`h-4 w-4 ${profile?.is_premium ? "text-yellow-500" : "text-muted-foreground"}`}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {profile?.is_premium ? "Premium" : "Básico"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                  { id: "overview" as const, label: "Visão Geral" },
                  { id: "plans" as const, label: "Planos" },
                  { id: "history" as const, label: "Histórico" },
                  { id: "refund" as const, label: "Reembolso" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="bg-background/50 border border-border rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      Resumo de Créditos
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Saldo atual</span>
                        <span className="text-foreground font-medium">{profile?.credits || 0} créditos</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Planos adquiridos</span>
                        <span className="text-foreground font-medium">{plans.length}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      onOpenCredits();
                    }}
                    className="w-full bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 text-primary-foreground font-semibold py-6"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Adquirir Mais Créditos
                  </Button>
                </div>
              )}

              {activeTab === "plans" && (
                <div className="space-y-3">
                  {plans.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhum plano adquirido ainda</p>
                      <Button
                        onClick={() => {
                          onOpenCredits();
                        }}
                        className="mt-4"
                        variant="outline"
                      >
                        Ver Planos
                      </Button>
                    </div>
                  ) : (
                    plans.map((plan) => (
                      <div key={plan.id} className="bg-background/50 border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{plan.plan_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {plan.credits_purchased} créditos • {formatPrice(plan.amount_paid)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Adquirido em {formatDate(plan.acquired_at)}
                            </p>
                          </div>
                          {plan.is_lifetime && (
                            <span className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold">
                              Vitalício
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-2">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma transação ainda</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                              tx.amount > 0 ? "bg-success/10" : "bg-destructive/10"
                            }`}
                          >
                            <Coins className={`h-4 w-4 ${tx.amount > 0 ? "text-success" : "text-destructive"}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {tx.description || tx.transaction_type}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "refund" && (
                <div className="space-y-4">
                  {refundSubmitted ? (
                    <div className="text-center py-8">
                      <div className="h-16 w-16 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Solicitação Enviada!</h3>
                      <p className="text-muted-foreground text-sm">
                        Sua solicitação de reembolso foi recebida. Nossa equipe analisará e entrará em contato em até 7
                        dias úteis.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Guarantee Info */}
                      <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 border border-emerald-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <RotateCcw className="h-5 w-5 text-emerald-400" />
                          <h3 className="font-semibold text-emerald-300">Garantia Incondicional</h3>
                        </div>
                        <p className="text-sm text-emerald-200/80">
                          Se você não ficou satisfeito com os resultados, pode solicitar o reembolso total do seu último
                          pagamento.
                        </p>
                      </div>

                      {/* Warning */}
                      <div className="bg-amber-950/50 border border-amber-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-amber-300 text-sm mb-1">Importante</h4>
                            <p className="text-xs text-amber-200/70">
                              O reembolso será processado para o mesmo método de pagamento utilizado. Créditos já
                              utilizados serão descontados proporcionalmente.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Refund Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Motivo do reembolso (opcional)
                          </label>
                          <textarea
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            placeholder="Conte-nos o que aconteceu para melhorarmos nosso serviço..."
                            className="w-full h-24 px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        <Button
                          onClick={() => {
                            setRefundSubmitting(true);
                            // Simulate submission
                            setTimeout(() => {
                              setRefundSubmitting(false);
                              setRefundSubmitted(true);
                            }, 2000);
                          }}
                          disabled={refundSubmitting}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-6"
                        >
                          {refundSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Solicitar Reembolso
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Plans eligible for refund */}
                      {plans.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Planos elegíveis:</h4>
                          <div className="space-y-2">
                            {plans.slice(0, 3).map((plan) => (
                              <div
                                key={plan.id}
                                className="flex items-center justify-between py-2 px-3 bg-background/30 rounded-lg border border-border/50"
                              >
                                <span className="text-sm text-foreground">{plan.plan_name}</span>
                                <span className="text-xs text-muted-foreground">{formatDate(plan.acquired_at)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Delete Account */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <button
                  onClick={() => setShowDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Apagar meu acesso
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <DeleteAccountModal isOpen={showDelete} onClose={() => setShowDelete(false)} />
    </div>
  );
};

export default UserAccountModal;
