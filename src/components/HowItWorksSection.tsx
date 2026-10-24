import { Button } from "@/components/ui/button";
import { ArrowRight, KeyRound, Upload, Download } from "lucide-react";

interface HowItWorksSectionProps {
  onCTAClick: () => void;
}

const HowItWorksSection = ({ onCTAClick }: HowItWorksSectionProps) => {
  const steps = [
    { 
      number: 1, 
      title: "Manda a foto dela",
      description: "Confirme maioridade e consentimento",
      icon: Upload,
    },
    { 
      number: 2, 
      title: "Digite seu código",
      description: "Acesso individual, sem cadastro",
      icon: KeyRound,
    },
    { 
      number: 3, 
      title: "Vê o resultado",
      description: "Vídeo pronto em 30 segundos",
      icon: Download,
    },
  ];

  return (
    <section className="relative py-14 md:py-28 section-glow overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium text-primary">3 passos simples</span>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            Simples, rápido e direto.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 lg:gap-10 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative flex-1 w-full max-w-xs">
              {/* Connector line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="group card-glass card-glass-hover rounded-2xl p-6 md:p-8 text-center">
                {/* Number badge */}
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full scale-150" />
                  <div className="relative number-badge w-16 h-16 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{step.number}</span>
                  </div>
                </div>
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-secondary/80 border border-border flex items-center justify-center mx-auto mb-4 group-hover:border-primary/30 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 md:mt-14 flex justify-center">
          <Button 
            size="lg" 
            className="group w-full sm:w-auto bg-gradient-to-r from-primary via-red-500 to-primary bg-[length:200%_100%] hover:bg-right text-primary-foreground font-bold px-10 py-7 text-lg rounded-2xl btn-glow transition-all duration-500"
            onClick={onCTAClick}
          >
            <span className="flex items-center gap-3">
              Começar agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
