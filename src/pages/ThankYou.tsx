import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Coins, Sparkles, ArrowRight, Clock, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import magnetizeLogo from "@/assets/magnetize-logo-icon.png";
import { initFacebookPixel, trackPurchase } from "@/lib/facebook-pixel";
import { initTikTokPixel, trackPurchase as trackTikTokPurchase } from "@/lib/tiktok-pixel";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planName = searchParams.get("plan") || "Seu plano";
  const credits = parseInt(searchParams.get("credits") || "0");
  const isPriority = searchParams.get("isPriority") === "true";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const transactionId = searchParams.get("tx") || "";

  const formatCredits = (value: number) => {
    if (value >= 999999) return "∞ Ilimitados";
    return value.toLocaleString('pt-BR');
  };

  // Facebook Pixel - Purchase event on thank you page (deduplicated with the server event)
  useEffect(() => {
    initFacebookPixel();
    const purchaseValue = amount > 0 ? amount / 100 : 0;
    trackPurchase({
      content_name: planName,
      value: purchaseValue,
      currency: 'BRL',
      eventID: transactionId ? `purchase_${transactionId}` : undefined,
    });
  }, [planName, amount, transactionId]);


  // TikTok Pixel - Purchase event on thank you page
  useEffect(() => {
    initTikTokPixel();
    const purchaseValue = amount > 0 ? amount / 100 : 0;
    trackTikTokPurchase({
      content_name: planName,
      value: purchaseValue,
      currency: 'BRL'
    });
  }, [planName, amount]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Success Card */}
        <div className="card-glass rounded-3xl p-8 md:p-10 text-center">
          {/* Success Icon */}
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-success/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg shadow-success/30">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-foreground mb-3">
            {isPriority ? "Acesso Prioritário Ativado! 🚀" : "Pagamento Confirmado! 🎉"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isPriority 
              ? "Você agora tem prioridade máxima em todas as gerações"
              : "Seu pagamento foi processado com sucesso"
            }
          </p>

          {/* Plan Info */}
          <div className="bg-gradient-to-r from-primary/10 to-red-600/10 border border-primary/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center p-2">
                <img 
                  src={magnetizeLogo}
                  alt="Magnetize"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-foreground">{planName}</h3>
                <p className="text-sm text-muted-foreground">Ativado com sucesso</p>
              </div>
            </div>

            {!isPriority && credits > 0 && (
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-success/10 border border-success/20">
                <Coins className="h-5 w-5 text-success" />
                <span className="font-bold text-success text-lg">
                  +{formatCredits(credits)} créditos
                </span>
                <span className="text-success/70 text-sm">adicionados</span>
              </div>
            )}

            {isPriority && (
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-success/10 border border-success/20">
                <Rocket className="h-5 w-5 text-success" />
                <span className="font-bold text-success text-lg">
                  Prioridade Vitalícia
                </span>
              </div>
            )}
          </div>

          {/* Wait Time Notice - Only for Priority */}
          {isPriority && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-8">
              <Clock className="h-6 w-6 text-yellow-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-foreground text-sm font-medium">Aguarde 30 minutos</p>
                <p className="text-muted-foreground text-xs">
                  Para melhor qualidade, aguarde 30 minutos antes de iniciar sua próxima geração.
                </p>
              </div>
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] hover:bg-right shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
          >
            {isPriority ? "Voltar ao Dashboard" : "Começar a Gerar"}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          {/* Sparkles decoration */}
          <div className="flex justify-center gap-2 mt-6">
            <Sparkles className="h-4 w-4 text-primary/50 animate-pulse" />
            <Sparkles className="h-5 w-5 text-primary animate-pulse delay-100" />
            <Sparkles className="h-4 w-4 text-primary/50 animate-pulse delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
