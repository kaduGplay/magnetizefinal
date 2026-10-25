import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useTikTokPixel from "@/hooks/useTikTokPixel";
import { useAuth } from "@/hooks/useAuth";
import { trackPageView } from "@/lib/facebook-pixel";
import { preloadAppResources } from "@/lib/preloadAppResources";
import Index from "./pages/Index";
import { useSitePresence } from "@/hooks/useSitePresence";
import NotFound from "./pages/NotFound";

const Analysis = lazy(() => import("./pages/Analysis"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const FastGenerations = lazy(() => import("./pages/FastGenerations"));
const Auth = lazy(() => import("./pages/Auth"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Mantém a sessão sincronizada em TODAS as rotas (inclusive a landing),
// para que o retorno do login social retome o funil e leve à dashboard.
const AuthSessionSync = () => {
  useAuth();
  return null;
};

const AppContent = () => {
  useTikTokPixel();
  useSitePresence();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    preloadAppResources();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  // Navegação instantânea disparada pelo fluxo de login social (sem reload).
  useEffect(() => {
    const onNav = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      if (typeof path !== "string") return;
      window.dispatchEvent(new Event("magnetize:navigated"));
      navigate(path, { replace: true });
    };
    window.addEventListener("magnetize:navigate", onNav);
    return () => window.removeEventListener("magnetize:navigate", onNav);
  }, [navigate]);

  return (
    <Suspense fallback={<PageFallback />}>
      <AuthSessionSync />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/analise" element={<Analysis />} />
        {/* Rotas virtuais do funil da landing (modais contam como páginas) */}
        <Route path="/escolher-modelo" element={<Index />} />
        <Route path="/gerando" element={<Index />} />
        <Route path="/resultado" element={<Index />} />
        <Route path="/criar-conta" element={<Index />} />
        <Route path="/entrar" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Rotas virtuais dos modais da dashboard */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/fast-generations" element={<FastGenerations />} />
        <Route path="/politic" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
