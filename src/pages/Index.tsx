import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ImageUploadSection from "@/components/ImageUploadSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FAQSection from "@/components/FAQSection";
import { useUtmCapture } from "@/hooks/useUtmParams";
import { useNavigate } from "react-router-dom";

const Index = () => {
  useUtmCapture();
  const navigate = useNavigate();
  const goToDashboard = () => navigate("/dashboard");

  return (
    <div
      className="min-h-screen bg-background overflow-x-hidden"
      onClickCapture={(event) => {
        if ((event.target as Element).closest('button, input[type="file"], [role="button"]')) {
          event.preventDefault();
          event.stopPropagation();
          goToDashboard();
        }
      }}
    >
      <Header onAccessAccount={goToDashboard} />
      
      <main>
        <HeroSection onCTAClick={goToDashboard} />
        <ImageUploadSection
          onImageSelect={goToDashboard}
        />
        <HowItWorksSection onCTAClick={goToDashboard} />
        <FAQSection onCTAClick={goToDashboard} />
      </main>


      
      {/* Footer */}
      <footer className="relative py-10 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="container relative text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img 
              src="/media/logo.jpeg" 
              alt="Magnetize Logo" 
              className="h-6 w-auto rounded"
            />
            <span className="font-bold text-foreground">Magnetize</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            O Magnetize é um aplicativo de inteligência artificial que transforma
            uma foto em vídeos e imagens realistas em segundos: você envia a foto,
            escolhe um modelo e recebe o resultado direto no celular, com
            privacidade total.
          </p>
          <div className="flex items-center justify-center gap-4 mb-4 text-xs text-muted-foreground">
            <a href="/politic" className="underline underline-offset-2 hover:text-foreground transition-colors">Política de Privacidade</a>
            <span aria-hidden>•</span>
            <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Termos de Serviço</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Magnetize Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
