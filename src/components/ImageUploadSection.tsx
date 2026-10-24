import { useState, useRef, useEffect } from "react";
import { Upload, Image, Shield, AlertTriangle } from "lucide-react";
import ConsentConfirmationModal from "@/components/ConsentConfirmationModal";
interface ImageUploadSectionProps {
  onImageSelect: (file: File) => void;
  registerOpenPicker?: (fn: () => void) => void;
}
const ImageUploadSection = ({ onImageSelect, registerOpenPicker }: ImageUploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    registerOpenPicker?.(() => fileInputRef.current?.click());
  }, [registerOpenPicker]);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return URL.createObjectURL(file);
      });
      setShowConsent(true);
    }
  };
  const isValidFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 50 * 1024 * 1024; // 50MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
      setPreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return URL.createObjectURL(file);
      });
      setShowConsent(true);
    }
    e.target.value = "";
  };
  return (
    <section className="relative py-12 md:py-24 section-glow">
      <div className="container relative z-10">
        {/* Review Section */}
        <div className="max-w-xl mx-auto mb-10 md:mb-16 space-y-6 md:space-y-8">
          <div className="text-center">
            <h3 className="text-xl md:text-3xl font-black text-foreground mb-6">
              Olha o que esses caras estão falando de nós 🔥
            </h3>
          </div>

          <div className="grid gap-4">
            {[
              {
                text: "Mandei a foto da mina da academia só pra testar... quando vi o vídeo pronto não acreditei. Parece real demais, até o jeito de mexer.",
                author: "Marcos S.",
                verified: true,
              },
              {
                text: "Achei que era golpe, mas em 30 segundos tava pronto. Já usei com 4 fotos diferentes essa semana. Esse Magnetize é do caralho!",
                author: "Ricardo L.",
                verified: true,
              },
              {
                text: "O que me pegou foi a privacidade. Não pede nada, não salva nada. Fiz o meu, baixei e sumiu. Melhor investimento que já fiz.",
                author: "André M.",
                verified: true,
              },
            ].map((review, i) => (
              <div
                key={i}
                className="card-glass p-5 md:p-6 rounded-2xl border border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-colors"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground/90 italic mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-primary">{review.author}</span>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                      <Shield className="w-3 h-3" /> Verificado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

              </div>
    </section>
  );
};

export default ImageUploadSection;