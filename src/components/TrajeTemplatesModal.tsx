import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TemplateUploadModal from "./TemplateUploadModal";

import nuImg from "@/assets/templates/traje/nu.webp";
import lingerieImg from "@/assets/templates/traje/lingerie.webp";
import miniBiquiniImg from "@/assets/templates/traje/mini-biquini.webp";
import bdsmImg from "@/assets/templates/traje/bdsm.webp";
import espartilhoImg from "@/assets/templates/traje/espartilho.webp";
import biquiniImg from "@/assets/templates/traje/biquini.webp";
import latexImg from "@/assets/templates/traje/latex.webp";
import gravidaImg from "@/assets/templates/traje/gravida.webp";

interface TrajeTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const templates = [
  { id: "nu", label: "Nu", src: nuImg, badge: "HOT" },
  { id: "lingerie", label: "Lingerie", src: lingerieImg, badge: "NOVO" },
  { id: "mini-biquini", label: "Mini biquíni", src: miniBiquiniImg },
  { id: "bdsm", label: "BDSM", src: bdsmImg },
  { id: "espartilho", label: "Espartilho", src: espartilhoImg },
  { id: "biquini", label: "Biquíni", src: biquiniImg },
  { id: "latex", label: "Látex", src: latexImg, badge: "NOVO" },
  { id: "gravida", label: "Grávida", src: gravidaImg, badge: "HOT" },
];

const TrajeTemplatesModal = ({ isOpen, onClose, onSelectTemplate }: TrajeTemplatesModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);

  const handleTemplateClick = (template: typeof templates[0]) => {
    setSelectedTemplate(template);
  };

  const handleUploadClose = () => {
    setSelectedTemplate(null);
  };

  const handleGenerate = (file: File) => {
    console.log("Generating with file:", file.name, "for template:", selectedTemplate?.id);
    onSelectTemplate(selectedTemplate?.id || "");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !selectedTemplate} onOpenChange={(open) => !open && onClose()}>
        <DialogContent fullscreen className="bg-background">
          <DialogHeader className="z-20 flex shrink-0 flex-row items-center justify-between border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
            <DialogTitle className="text-base sm:text-xl font-bold text-foreground pr-10 text-left">
              ESCOLHA O TRAJE
            </DialogTitle>
          </DialogHeader>
          
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-card border border-border hover:border-primary transition-all duration-300"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={template.src}
                    alt={template.label}
                    className="w-full h-full object-contain bg-black"
                  />
                  
                  {/* Badge */}
                  {template.badge && (
                    <span className={`absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold ${
                      template.badge === "HOT" ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"
                    }`}>
                      {template.badge}
                    </span>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  
                  {/* Label */}
                  <div className="absolute bottom-2 left-0 right-0 text-center px-1">
                    <span className="text-foreground font-medium text-xs leading-tight flex items-center justify-center gap-1">
                      {template.label}
                      <Star className="h-3 w-3 text-primary fill-primary" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTemplate && (
        <TemplateUploadModal
          isOpen={!!selectedTemplate}
          onClose={handleUploadClose}
          templateName={selectedTemplate.label}
          templateImage={selectedTemplate.src}
          onGenerate={handleGenerate}
        />
      )}
    </>
  );
};

export default TrajeTemplatesModal;
