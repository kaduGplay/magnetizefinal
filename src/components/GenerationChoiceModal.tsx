import { useEffect, useState } from "react";
import { Star, Image as ImageIcon, Video, Check, Sparkles, Flame, ArrowLeft, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AutoplayVideo from "@/components/AutoplayVideo";

import missionarioImg from "@/assets/templates/missionario.webp";
import injecaoEspermaImg from "@/assets/templates/injecao-esperma.webp";
import sexoAnalImg from "@/assets/templates/sexo-anal.webp";
import estiloCachorrinhoImg from "@/assets/templates/estilo-cachorrinho.webp";
import povCowgirlImg from "@/assets/templates/pov-cowgirl.webp";
import trabalhoSeiosImg from "@/assets/templates/trabalho-seios.webp";
import mostrandoPeitosImg from "@/assets/templates/mostrando-peitos.webp";
import shibariImg from "@/assets/templates/shibari.webp";
import pernasAbertasImg from "@/assets/templates/pernas-abertas.webp";
import acumulacaoPovImg from "@/assets/templates/acumulacao-pov.webp";

import nuImg from "@/assets/templates/traje/nu.webp";
import lingerieImg from "@/assets/templates/traje/lingerie.webp";
import miniBiquiniImg from "@/assets/templates/traje/mini-biquini.webp";
import bdsmImg from "@/assets/templates/traje/bdsm.webp";
import espartilhoImg from "@/assets/templates/traje/espartilho.webp";
import biquiniImg from "@/assets/templates/traje/biquini.webp";
import latexImg from "@/assets/templates/traje/latex.webp";
import gravidaImg from "@/assets/templates/traje/gravida.webp";
// Edite os links completos em src/lib/videoExampleLinks.ts.
import { ahegaoVideo, boqueteVideo, cowgirlVideo, masturbacaoPeitosVideo, masturbacaoVideo, missionarioVideo, mostraPeitosVideo, pufVideo, rebolarVideo } from "@/lib/videoExampleLinks";

export interface GenerationChoice {
  type: "photo" | "video";
  templateId: string;
  templateLabel: string;
  mediaSrc: string;
}

interface GenerationChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  onSelect: (choice: GenerationChoice) => void;
}

type PhotoTemplate = { id: string; label: string; src: string; badge?: string; star?: boolean };
type VideoTemplate = { id: string; label: string; src: string; badge?: string; star?: boolean };

const photoTemplates: PhotoTemplate[] = [
  { id: "missionario", label: "Missionário", src: missionarioImg, badge: "HOT" },
  { id: "estilo-cachorrinho", label: "Estilo cachorrinho", src: estiloCachorrinhoImg, star: true },
  { id: "pov-cowgirl", label: "POV de cowgirl", src: povCowgirlImg },
  { id: "trabalho-seios", label: "Trabalho com os seios", src: trabalhoSeiosImg },
  { id: "mostrando-peitos", label: "Mostrando peitos", src: mostrandoPeitosImg },
  { id: "shibari", label: "Shibari", src: shibariImg, star: true },
  { id: "pernas-abertas", label: "Pernas abertas", src: pernasAbertasImg },
  { id: "sexo-anal", label: "Sexo anal", src: sexoAnalImg },
  { id: "injecao-esperma", label: "Injeção de esperma", src: injecaoEspermaImg, badge: "NOVO" },
  { id: "acumulacao-pov", label: "Acumulação POV", src: acumulacaoPovImg },
  { id: "nu", label: "Nu", src: nuImg, badge: "HOT" },
  { id: "lingerie", label: "Lingerie", src: lingerieImg, badge: "NOVO" },
  { id: "mini-biquini", label: "Mini biquíni", src: miniBiquiniImg },
  { id: "bdsm", label: "BDSM", src: bdsmImg },
  { id: "biquini", label: "Biquíni", src: biquiniImg },
  { id: "espartilho", label: "Espartilho", src: espartilhoImg },
  { id: "latex", label: "Látex", src: latexImg, badge: "NOVO" },
  { id: "gravida", label: "Grávida", src: gravidaImg, badge: "HOT" },
];

const videoTemplates: VideoTemplate[] = [
  { id: "cowgirl-reverso", label: "Cowgirl Reverso 2.0", src: cowgirlVideo, star: true },
  { id: "rebolar", label: "Rebolar 2.0", src: rebolarVideo },
  { id: "puf", label: "Puf!", src: pufVideo },
  { id: "missionario-video", label: "Missionário 2.0", src: missionarioVideo },
  { id: "ahegao", label: "Ahegao", src: ahegaoVideo, star: true },
  { id: "masturbacao-peitos", label: "Masturbação de peitos 2.0", src: masturbacaoPeitosVideo, badge: "NOVO" },
  { id: "mostra-peitos", label: "Mostra peitos", src: mostraPeitosVideo, badge: "HOT" },
  { id: "masturbacao", label: "Masturbação 2.0", src: masturbacaoVideo },
  { id: "boquete", label: "Boquete 2.0", src: boqueteVideo, star: true },
];

const GenerationChoiceModal = ({ isOpen, onClose, photoUrl, onSelect }: GenerationChoiceModalProps) => {
  const [generationType, setGenerationType] = useState<"photo" | "video" | null>(null);

  useEffect(() => {
    if (isOpen) setGenerationType(null);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent fullscreen className="bg-background">
        {/* Header sticky com a foto enviada */}
        <div className="z-20 shrink-0 border-b border-border bg-background/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3 pr-10">
            {photoUrl && (
              <div className="relative shrink-0">
                <img
                  src={photoUrl}
                  alt="Sua foto enviada"
                  className="w-11 h-11 rounded-xl object-cover border-2 border-primary"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              </div>
            )}
            <div className="text-left min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-foreground leading-tight">
                {generationType ? "Agora escolha o modelo" : "Foto confirmada! O que deseja gerar?"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {generationType
                  ? `Mostrando somente modelos de ${generationType === "photo" ? "imagem" : "vídeo"}`
                  : "Sua foto será usada na opção que você escolher"}
              </p>
            </div>
          </div>

          {generationType && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setGenerationType(null)}
              className="mt-3 gap-2 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Trocar tipo de geração
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          {!generationType ? (
            <div className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center gap-4 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGenerationType("photo")}
                className="group h-auto min-h-36 justify-between rounded-2xl border-primary/30 bg-card p-5 text-left hover:border-primary hover:bg-primary/10"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <ImageIcon className="h-7 w-7" />
                  </span>
                  <span>
                    <span className="block text-lg font-black text-foreground">Gerar imagem</span>
                    <span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">Escolha poses, trajes e estilos para transformar sua foto.</span>
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGenerationType("video")}
                className="group h-auto min-h-36 justify-between rounded-2xl border-primary/30 bg-card p-5 text-left hover:border-primary hover:bg-primary/10"
              >
                <span className="flex items-center gap-4">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Video className="h-7 w-7" />
                    <Flame className="absolute -right-1 -top-1 h-4 w-4 text-primary" />
                  </span>
                  <span>
                    <span className="block text-lg font-black text-foreground">Gerar vídeo</span>
                    <span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">Dê movimento à pessoa da foto com modelos realistas.</span>
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
              </Button>
            </div>
          ) : generationType === "photo" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {photoTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect({ type: "photo", templateId: template.id, templateLabel: template.label, mediaSrc: template.src })}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-card border-2 border-border active:border-primary active:scale-[0.97] hover:border-primary transition-all duration-200"
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    src={template.src}
                    alt={template.label}
                    className="w-full h-full object-contain bg-black"
                  />
                  {template.badge && (
                    <span className={`absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      template.badge === "HOT" ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"
                    }`}>
                      {template.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-0 right-0 text-center px-1">
                    <span className="text-foreground font-semibold text-xs leading-tight flex items-center justify-center gap-1">
                      {template.label}
                      {template.star && <Star className="h-3 w-3 text-primary fill-primary" />}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Vídeos realistas com a pessoa da sua foto
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {videoTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onSelect({ type: "video", templateId: template.id, templateLabel: template.label, mediaSrc: template.src })}
                    className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-card border-2 border-border active:border-primary active:scale-[0.97] hover:border-primary transition-all duration-200"
                  >
                    <AutoplayVideo
                      src={template.src || undefined}
                      className="w-full h-full object-contain bg-black absolute inset-0"
                    />
                    {template.badge && (
                      <span className={`absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        template.badge === "HOT" ? "bg-primary text-primary-foreground" : "bg-purple-500 text-white"
                      }`}>
                        {template.badge}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                    <div className="absolute bottom-3 left-0 right-0 text-center px-2">
                      <span className="text-foreground font-bold text-sm leading-tight flex items-center justify-center gap-1.5">
                        {template.label}
                        {template.star && <Star className="h-4 w-4 text-primary fill-primary" />}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerationChoiceModal;
