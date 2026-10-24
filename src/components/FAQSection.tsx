import { useState } from "react";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQSectionProps {
  onCTAClick: () => void;
}

const FAQSection = ({ onCTAClick }: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "Minhas imagens ficam salvas?",
      answer: "Não. As imagens são processadas automaticamente e descartadas imediatamente após a geração do resultado. Nenhum dado é armazenado em nossos servidores.",
    },
    {
      question: "É complicado de usar?",
      answer: "Não. Todo o processo foi pensado para ser intuitivo e simples. Basta fazer upload da imagem e aguardar poucos segundos pelo resultado.",
    },
    {
      question: "O serviço é seguro?",
      answer: "Sim. Utilizamos criptografia de ponta a ponta e não armazenamos nenhuma imagem. Todo o processamento é feito por inteligência artificial, sem acesso humano.",
    },
    {
      question: "Quanto tempo leva para gerar?",
      answer: "O processamento é quase instantâneo. Em média, o resultado fica pronto em cerca de 30 segundos dependendo da complexidade da imagem.",
    },
  ];

  return (
    <section className="relative py-14 md:py-28 section-glow">
      <div className="container relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Dúvidas frequentes</span>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Perguntas frequentes
          </h2>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`card-glass rounded-2xl overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'border border-primary/30 glow-ring' : 'border border-transparent'
              }`}
            >
              <button
                className="w-full p-5 md:p-6 flex items-center justify-between text-left group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-foreground pr-4 group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  openIndex === index ? 'bg-primary/20 border-primary/30 rotate-180' : 'group-hover:border-primary/30'
                }`}>
                  <ChevronDown className={`w-5 h-5 transition-colors ${
                    openIndex === index ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-72' : 'max-h-0'
              }`}>
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
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

export default FAQSection;
