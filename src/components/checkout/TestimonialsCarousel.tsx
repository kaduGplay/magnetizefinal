import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Star } from "lucide-react";

interface Testimonial {
  id: number;
  text: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "Comprei, recebi os créditos instantaneamente e já criei meus vídeos 😈😈",
    rating: 5,
  },
  {
    id: 2,
    text: "Aplicativo muito bom, tinha uma vizinha que queria ver ela pelada a muito tempo, tirei uma foto e o aplicativo fez o resto. Muito bom !!",
    rating: 5,
  },
  {
    id: 3,
    text: "Nunca gozei tanto, aplicativo surreal de bom !",
    rating: 5,
  },
  {
    id: 4,
    text: "Pagamento foi super rápido e seguro, recebi na hora. Recomendo demais! 🔥",
    rating: 5,
  },
  {
    id: 5,
    text: "Finalmente consegui realizar minha fantasia, valeu cada centavo. Sistema funciona perfeitamente! 😏",
    rating: 5,
  },
  {
    id: 6,
    text: "Melhor investimento que fiz, os resultados são incríveis. Super realista! 💯",
    rating: 5,
  },
  {
    id: 7,
    text: "Achei que era golpe mas funcionou demais, paguei e em 2 minutos já tava usando. Top!",
    rating: 5,
  },
  {
    id: 8,
    text: "Qualidade surreal, parece muito real. Vou comprar mais créditos com certeza 🔥🔥",
    rating: 5,
  },
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-red-500/10 border border-primary/30 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Comentários dos Usuários</h3>
          <p className="text-xs text-muted-foreground">O que nossos clientes estão dizendo</p>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Testimonial Card */}
        <div className="bg-background/50 border border-border rounded-xl p-5 min-h-[140px] flex flex-col justify-between">
          {/* Stars */}
          <div className="flex gap-1 mb-3">
            {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            ))}
          </div>
          
          {/* Text */}
          <p className="text-foreground/90 text-sm leading-relaxed flex-1">
            "{testimonials[currentIndex].text}"
          </p>
          
          {/* Anonymous User */}
          <div className="flex items-center gap-2 mt-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white text-xs font-bold">
              U{testimonials[currentIndex].id}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Usuário Anônimo</p>
              <p className="text-xs text-muted-foreground">Cliente verificado ✓</p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 border border-border shadow-lg flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "w-6 bg-primary" 
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        {currentIndex + 1} de {testimonials.length} avaliações
      </p>
    </div>
  );
};

export default TestimonialsCarousel;
