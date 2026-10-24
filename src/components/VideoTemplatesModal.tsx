import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TemplateUploadModal from "./TemplateUploadModal";
import AutoplayVideo from "@/components/AutoplayVideo";
// Edite os links completos em src/lib/videoExampleLinks.ts.
import { ahegaoVideo, boqueteVideo, cowgirlVideo, masturbacaoPeitosVideo, masturbacaoVideo, missionarioVideo, mostraPeitosVideo, pufVideo, rebolarVideo } from "@/lib/videoExampleLinks";

interface VideoTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const templates = [
  { id: "cowgirl-reverso", label: "Cowgirl Reverso 2.0", src: cowgirlVideo, star: true },
  { id: "rebolar", label: "Rebolar 2.0", src: rebolarVideo },
  { id: "puf", label: "Puf!", src: pufVideo },
  { id: "missionario", label: "Missionário 2.0", src: missionarioVideo },
  { id: "ahegao", label: "Ahegao", src: ahegaoVideo, star: true },
  { id: "masturbacao-peitos", label: "Masturbação de peitos 2.0", src: masturbacaoPeitosVideo, badge: "NOVO" },
  { id: "mostra-peitos", label: "Mostra peitos", src: mostraPeitosVideo, badge: "HOT" },
  { id: "masturbacao", label: "Masturbação 2.0", src: masturbacaoVideo },
  { id: "boquete", label: "Boquete 2.0", src: boqueteVideo, star: true },
];

const VideoTemplatesModal = ({ isOpen, onClose, onSelectTemplate }: VideoTemplatesModalProps) => {
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
              ESCOLHA UM MODELO DE VÍDEO
            </DialogTitle>
          </DialogHeader>
          
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-card border-2 border-border hover:border-primary hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-primary/30"
                >
                  <AutoplayVideo
                    src={template.src || undefined}
                    className="w-full h-full object-contain bg-black absolute inset-0"
                    onError={(e) => console.log("Video error for:", template.id, e)}
                  />
                  
                  {/* Badge */}
                  {template.badge && (
                    <span className={`absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold ${
                      template.badge === "HOT" ? "bg-primary text-primary-foreground" : "bg-purple-500 text-white"
                    }`}>
                      {template.badge}
                    </span>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                  
                  {/* Label */}
                  <div className="absolute bottom-3 left-0 right-0 text-center px-2">
                    <span className="text-foreground font-bold text-sm md:text-base leading-tight flex items-center justify-center gap-1.5">
                      {template.label}
                      {template.star && <Star className="h-4 w-4 text-primary fill-primary" />}
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
          isVideo={true}
        />
      )}
    </>
  );
};

export default VideoTemplatesModal;
