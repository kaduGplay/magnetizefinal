import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Copy, 
  Shield, 
  Lock, 
  Clock, 
  CheckCircle,
  Loader2,
  Coins,
  AlertCircle,
  EyeOff,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { callAccessApi, getAccessToken, useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import magnetizeLogo from "@/assets/magnetize-logo-icon.png";
import GuaranteeSection from "@/components/checkout/GuaranteeSection";
import TestimonialsCarousel from "@/components/checkout/TestimonialsCarousel";
import { initFacebookPixel, trackViewContent, trackInitiateCheckout as trackFbInitiateCheckout, trackAddPaymentInfo } from "@/lib/facebook-pixel";
import { initTikTokPixel, trackViewContent as trackTikTokViewContent, trackInitiateCheckout } from "@/lib/tiktok-pixel";
import { clearPendingCheckout, savePendingCheckout } from "@/lib/pendingCheckout";
import { sequentialPaymentAttempts } from "@/lib/paymentAttempt";

interface PixPaymentData {
  pixQrcode: string;
  pixExpirationDate: string;
  transactionId: string;
  pixImage?: string;
  pixBase64?: string;
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [hasGeneratedPix, setHasGeneratedPix] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const paymentInFlight = useRef(false);
  const [secondsUntilCheck, setSecondsUntilCheck] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);


  const loadingMessages = [
    "Conectando ao banco...",
    "Gerando código PIX...",
    "Validando transação...",
    "Preparando QR Code...",
    "Finalizando...",
  ];


  const planId = searchParams.get("plan") || "";
  const planName = searchParams.get("name") || "";
  const amount = parseInt(searchParams.get("amount") || "0");
  const credits = parseInt(searchParams.get("credits") || "0");
  const isLifetime = searchParams.get("isLifetime") === "true";
  const isPremium = searchParams.get("isPremium") === "true";

  // Capture UTM parameters from URL
  const utmParams = {
    src: searchParams.get("src") || null,
    sck: searchParams.get("sck") || null,
    utm_source: searchParams.get("utm_source") || null,
    utm_campaign: searchParams.get("utm_campaign") || null,
    utm_medium: searchParams.get("utm_medium") || null,
    utm_content: searchParams.get("utm_content") || null,
    utm_term: searchParams.get("utm_term") || null,
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth", { state: { returnTo: `/checkout?${searchParams.toString()}` }, replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Facebook Pixel - ViewContent on checkout page
  useEffect(() => {
    initFacebookPixel();
    trackViewContent({
      content_name: planName || 'Checkout',
      value: amount / 100,
      currency: 'BRL'
    });
    trackFbInitiateCheckout({ content_name: planName || 'Checkout', value: amount / 100, num_items: 1 });
  }, [planName, amount]);

  // TikTok Pixel - ViewContent + InitiateCheckout on checkout page
  useEffect(() => {
    initTikTokPixel();
    trackTikTokViewContent({
      content_name: planName || 'Checkout',
      value: amount / 100,
      currency: 'BRL'
    });
    trackInitiateCheckout({
      content_name: planName || 'Checkout',
      value: amount / 100,
      currency: 'BRL'
    });
  }, [planName, amount]);

  useEffect(() => {
    // Evita gerar PIX múltiplas vezes
    if (hasGeneratedPix || pixData) {
      return;
    }

    if (!planId || !planName || amount <= 0 || authLoading || !profile) {
      if (!authLoading && !profile && isAuthenticated) {
        // Profile still loading
        return;
      }
      if (!planId || !planName || amount <= 0) {
        setError("Dados do plano inválidos");
        setIsLoading(false);
      }
      return;
    }

    setHasGeneratedPix(true);
    generatePix();
  }, [planId, planName, amount, profile, authLoading, hasGeneratedPix, pixData]);

  const generatePix = async () => {
    if (paymentInFlight.current) return;
    if (!profile) {
      setError("Usuário não autenticado");
      setIsLoading(false);
      return;
    }

    paymentInFlight.current = true;
    setIsLoading(true);
    setError(null);
    setLoadingStep(0);
    setSecondsLeft(null);
    
    // Animação de loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);
    
    try {
      // Renova o acesso legado pela API compartilhada antes de cobrar.
      const session = await callAccessApi({ action: "session" });
      if (!session.success) {
        setError(String(session.error || "Não foi possível verificar sua sessão. Tente novamente."));
        setIsLoading(false);
        return;
      }
      const { data, error } = await sequentialPaymentAttempts(async () => {
        const response = await supabase.functions.invoke("create-pix-payment", {
        headers: { "x-access-token": getAccessToken() || "" },
        body: {
          planId,
          planName,
          amount,
          credits,
          isLifetime,
          isPremium,
          customerName: profile.full_name,
          customerEmail: profile.email || undefined,
          customerPhone: (profile.phone || "").replace(/\D/g, "").slice(-11),
          utmParams,
        },
        });
        const status = (response.error as { context?: Response } | null)?.context?.status;
        if (response.error && (!status || status >= 500)) throw response.error;
        return response;
      });

      clearInterval(stepInterval);

      if (error) {
        console.error("Error creating payment:", error);
        // Detect abuse-limit response from the edge function (429) so we can
        // force sign-out and show the user a clear message.
        try {
          const ctx = (error as { context?: Response })?.context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.clone().json();
            if (body?.code === "ABUSE_LIMIT") {
              clearInterval(stepInterval);
              toast.error(body.error, { duration: 8000 });
              signOut();
              navigate("/auth");
              return;
            }
          }
        } catch {
          // ignore parse errors and fall through to retry
        }
        setError("Não foi possível gerar o PIX. Tente novamente.");
        setIsLoading(false);
        return;
      }

      if (data?.code === "ABUSE_LIMIT") {
        toast.error(data.error, { duration: 8000 });
        signOut();
        navigate("/auth");
        return;
      }

      if (data?.success && data?.pixQrcode) {
        savePendingCheckout({
          userId: profile.id,
          transactionId: data.transactionId,
          path: `/checkout?${searchParams.toString()}`,
          amount,
        }, data.reused === true);
        setPixData({
          pixQrcode: data.pixQrcode,
          pixExpirationDate: data.pixExpirationDate,
          transactionId: data.transactionId,
          pixImage: data.pixImage,
          pixBase64: data.pixBase64,
        });
        trackAddPaymentInfo({ content_name: planName, value: amount / 100 });
        setIsLoading(false);
      } else {
        setError("Não foi possível gerar o PIX. Tente novamente.");
        setIsLoading(false);
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("Error:", err);
      setError("Não foi possível gerar o PIX. Tente novamente.");
      setIsLoading(false);
    } finally {
      clearInterval(stepInterval);
      paymentInFlight.current = false;
    }
  };

  // Poll for payment status every 5 seconds
  useEffect(() => {
    if (!pixData?.transactionId) return;

    const checkPaymentStatus = async () => {
      try {
        const data = await callAccessApi({ action: "transaction-status", transactionId: pixData.transactionId });
        if (data.status === "paid") {
          clearPendingCheckout();
          toast.success("Pagamento confirmado!");
          const isPriorityPlan = planId === "priority";
          navigate(`/thank-you?plan=${encodeURIComponent(planName)}&credits=${credits}&isPriority=${isPriorityPlan}&amount=${amount}&tx=${pixData.transactionId}`);

        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    };

    // Check immediately
    checkPaymentStatus();
    setSecondsUntilCheck(5);

    // Then poll every 5 seconds
    const interval = setInterval(() => {
      checkPaymentStatus();
      setSecondsUntilCheck(5);
    }, 5000);

    // Countdown tick
    const tick = setInterval(() => {
      setSecondsUntilCheck((s) => (s > 1 ? s - 1 : 5));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [pixData?.transactionId, navigate, planName, credits]);

  // Contagem regressiva real de expiração do PIX
  useEffect(() => {
    if (!pixData) return;

    const parsed = pixData.pixExpirationDate ? new Date(pixData.pixExpirationDate).getTime() : NaN;
    if (!Number.isFinite(parsed)) {
      setSecondsLeft(null);
      return;
    }
    const deadline = parsed;

    const update = () => {
      setSecondsLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [pixData]);

  const formatCountdown = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const copyPixCode = async () => {
    if (!pixData?.pixQrcode) return;
    try {
      await navigator.clipboard.writeText(pixData.pixQrcode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o código PIX e copie manualmente.");
    }
  };


  const formatPrice = (value: number) => {
    return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatCredits = (value: number) => {
    if (value >= 999999) return "∞ Ilimitados";
    return value.toLocaleString('pt-BR');
  };

  // Get QR Code image - prefer KorePay v2 provided image, fallback to free API
  const getQrCodeUrl = () => {
    if (pixData?.pixBase64) {
      // Add data URI prefix if not already present
      if (pixData.pixBase64.startsWith("data:")) return pixData.pixBase64;
      return `data:image/png;base64,${pixData.pixBase64}`;
    }
    if (pixData?.pixImage) return pixData.pixImage;
    if (pixData?.pixQrcode) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.pixQrcode)}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/50" />
        <div className="container relative flex h-16 items-center justify-center px-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
              <img 
                src="/media/logo.jpeg"
                alt="Magnetize"
                className="relative h-7 w-auto rounded-lg"
              />
            </div>
          </div>

          {/* Botão para sair do checkout */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            aria-label="Sair do checkout"
            title="Sair do checkout"
            className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary/45 bg-secondary/90 text-foreground shadow-lg shadow-black/40 transition-colors hover:border-primary/70 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container relative px-4 py-8 md:py-12">
        <div className="max-w-lg mx-auto">
          
          {/* Loading State - Premium Design */}
          {(isLoading || authLoading) && (
            <div className="relative rounded-3xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] p-[2px] rounded-3xl">
                <div className="absolute inset-[2px] bg-gradient-to-b from-zinc-900 to-black rounded-3xl" />
              </div>
              
              <div className="relative p-8 md:p-12 text-center">
                {/* Glowing icon */}
                <div className="relative inline-flex mb-8">
                  <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/40 to-red-500/30 border border-primary/40 flex items-center justify-center shadow-2xl shadow-primary/30">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  Gerando seu PIX...
                </h2>

                {/* Resumo do pedido já visível durante a espera */}
                {planName && amount > 0 && (
                  <div className="mb-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-sm font-semibold text-white">{planName}</span>
                    <span className="h-4 w-px bg-white/20" />
                    <span className="text-sm font-black text-primary">{formatPrice(amount)}</span>
                  </div>
                )}

                {/* Animated step message */}
                <p className="text-white/60 mb-8 h-6 transition-all duration-300">
                  {loadingMessages[loadingStep]}
                </p>

                
                {/* Progress bar */}
                <div className="max-w-xs mx-auto mb-6">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-red-500 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Steps list */}
                <div className="flex flex-col items-center gap-2 text-sm">
                  {loadingMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        index < loadingStep 
                          ? 'text-green-400' 
                          : index === loadingStep 
                            ? 'text-white' 
                            : 'text-white/30'
                      }`}
                    >
                      {index < loadingStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : index === loadingStep ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-white/20" />
                      )}
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
                
                {/* Trust badge */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40">
                  <Lock className="h-3 w-3" />
                  <span>Transação 100% segura e criptografada</span>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && !authLoading && (
            <div className="card-glass rounded-3xl p-8 md:p-10 text-center">
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-destructive/30 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/30 to-destructive/10 border border-destructive/30 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Não conseguimos gerar agora</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    setError(null);
                                generatePix();
                  }}
                  className="h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}


          {/* PIX Payment */}
          {pixData && !isLoading && !authLoading && (
            <div className="space-y-6">
              {/* Plan Info Card */}
              <div className="card-glass rounded-2xl p-5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg shadow-primary/30 p-2">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={magnetizeLogo}
                        alt="Magnetize"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{planName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{formatCredits(credits)} créditos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">{formatPrice(amount)}</p>
                  </div>
                </div>
                
                {/* Secure Payment Banner */}
                <div className="mt-4">
                  <img
                    loading="lazy"
                    decoding="async"
                    src="/media/PAGAMENTOSEGURO.png"
                    alt="Pagamento Seguro"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>

              {/* Garantia acima do código: reduz medo antes de pagar */}
              <GuaranteeSection />

              {/* PIX Code Card */}
              <div className="card-glass rounded-3xl p-6 md:p-8">

                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">PIX Gerado com Sucesso</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento via PIX</h2>
                  <p className="text-muted-foreground">Copie o código abaixo e pague no app do seu banco</p>
                </div>

                {/* QR Code - sempre visível (mobile e desktop) */}
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-white rounded-2xl shadow-lg">
                    <img
                      decoding="async"
                      src={getQrCodeUrl()}
                      alt="QR Code PIX"
                      className="w-44 h-44 md:w-48 md:h-48"
                    />
                  </div>
                </div>

                {/* PIX Code Display - código completo, sem truncar */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-5 mb-4">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    Código PIX Copia e Cola
                  </p>
                  <div className="bg-background/80 rounded-xl p-4 border border-border max-h-20 overflow-y-auto">
                    <p className="text-foreground/80 text-xs font-mono leading-relaxed break-all">
                      {pixData.pixQrcode}
                    </p>
                  </div>
                </div>


                {/* Copy Button */}
                <Button
                  onClick={copyPixCode}
                  className={`w-full h-14 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    copied 
                      ? "bg-success hover:bg-success/90" 
                      : "bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] hover:bg-right shadow-lg shadow-primary/30 hover:shadow-primary/50"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Código Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      Copiar Código PIX
                    </>
                  )}
                </Button>

                {/* Anonimato: principal objeção do público */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-success" />
                    100% anônimo
                  </span>
                  <span className="h-3 w-px bg-border" />
                  <span>Não aparece na fatura</span>
                  <span className="h-3 w-px bg-border" />
                  <span>Sem nome do site</span>
                </div>



                {/* Step-by-step instructions */}
                <ol className="mt-6 space-y-3 text-sm text-foreground/90">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">1</span>
                    <span className="leading-relaxed">Abra o aplicativo do seu banco e realize o pagamento utilizando as informações copiadas.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">2</span>
                    <span className="leading-relaxed">Após realizar o pagamento, seu pedido será liberado em instantes!</span>
                  </li>
                </ol>

                {/* Pending status with progress bar */}
                <div className="mt-6 pt-5 border-t border-border">
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                      </span>
                      <span className="font-semibold text-amber-400">Pagamento pendente</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Verificando novamente em {secondsUntilCheck}s
                    </span>
                  </div>
                  <div className="h-1 bg-secondary/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${((5 - secondsUntilCheck) / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {secondsLeft === 0 && (
                  <Button className="mt-4 w-full" onClick={() => { setPixData(null); void generatePix(); }}>Gerar novo PIX</Button>
                )}

                {/* Timer real de expiração */}
                <div className={`flex items-center justify-center gap-2 mt-5 ${secondsLeft !== null && secondsLeft <= 120 ? "text-destructive" : "text-muted-foreground"}`}>
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {secondsLeft === null
                      ? "A validade do código é informada pelo seu banco."
                      : secondsLeft > 0
                        ? <>Este código expira em <strong className="font-mono">{formatCountdown(secondsLeft)}</strong></>
                        : "Código expirado — gere um novo PIX"}
                  </span>
                </div>

              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-800/40 rounded-2xl p-5 backdrop-blur-sm">
                <p className="text-sm text-amber-300/90 text-center leading-relaxed">
                  Após o pagamento, seus <strong>{formatCredits(credits)} créditos</strong> serão adicionados automaticamente em até 5 minutos.
                </p>
              </div>

              {/* Security Badges */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                  <Lock className="h-4 w-4 text-success" />
                  <span className="text-xs font-medium text-success">Criptografado</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-xs font-medium text-success">100% Seguro</span>
                </div>
              </div>




              {/* Testimonials Carousel */}
              <TestimonialsCarousel />

            </div>
          )}
        </div>
      </main>
    </div>
  );
};


export default Checkout;
