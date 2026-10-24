import { useState, useCallback, useRef } from "react";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InsufficientCreditsModal, { GENERATION_COST } from "./InsufficientCreditsModal";
import GenerationLoadingModal from "./GenerationLoadingModal";
import QueueErrorModal from "./QueueErrorModal";
import BlurredResultModal from "./BlurredResultModal";
import AutoplayVideo from "@/components/AutoplayVideo";
import ExitDownsellModal from "./ExitDownsellModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getStoredUtmParams } from "@/hooks/useUtmParams";
import { initTikTokPixel, trackAddToCart, trackInitiateCheckout } from "@/lib/tiktok-pixel";
import ConsentConfirmationModal from "@/components/ConsentConfirmationModal";

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  templateImage: string;
  onGenerate: (file: File) => void;
  isVideo?: boolean;
}

const TemplateUploadModal = ({ 
  isOpen, 
  onClose, 
  templateName, 
  templateImage,
  onGenerate,
  isVideo = false
}: TemplateUploadModalProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showDownsell, setShowDownsell] = useState(false);
  const [showQueueErrorModal, setShowQueueErrorModal] = useState(false);
  const [showBlurredResult, setShowBlurredResult] = useState(false);

  const currentCredits = profile?.credits || 0;
  const hasEnoughCredits = currentCredits >= GENERATION_COST;

  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem (PNG, JPG ou WEBP).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('A imagem precisa ter no máximo 50MB.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setShowConsent(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleLoadingComplete = useCallback(() => {
    setShowLoadingModal(false);

    // After loading, check credits
    setTimeout(() => {
      if (!hasEnoughCredits) {
        // Mostra o resultado borrado antes de pedir créditos
        setShowBlurredResult(true);
      } else {
        setShowQueueErrorModal(true);
      }
    }, 260);
  }, [hasEnoughCredits]);

  const handleBuyCredits = () => {
    setShowCreditsModal(false);
    handleClose();
    navigate("/dashboard");
    window.dispatchEvent(new CustomEvent('openCreditsModal'));
  };

  // Saiu do modal de planos sem comprar → oferta relâmpago (ilimitado por R$ 9,90)
  const handleCreditsClose = () => {
    setShowCreditsModal(false);
    setTimeout(() => setShowDownsell(true), 300);
  };

  const handleAcceptDownsell = (plan: { id: string; name: string; amountCents: number; credits: number; isLifetime: boolean; isPremium: boolean }) => {
    initTikTokPixel();
    trackAddToCart({ content_name: plan.name, value: plan.amountCents / 100, currency: "BRL" });

    const params = new URLSearchParams({
      plan: plan.id,
      name: plan.name,
      amount: plan.amountCents.toString(),
      credits: plan.credits.toString(),
      isLifetime: plan.isLifetime ? "true" : "false",
      isPremium: plan.isPremium ? "true" : "false",
    });
    const utm = getStoredUtmParams();
    if (utm) {
      Object.entries(utm).forEach(([k, v]) => {
        if (v) params.set(k, v as string);
      });
    }

    trackInitiateCheckout({ content_name: plan.name, value: plan.amountCents / 100, currency: "BRL" });
    window.location.assign(`/checkout?${params.toString()}`);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setShowConsent(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError(null);
    onClose();
  };

  const isStacked = showConsent || showLoadingModal || showCreditsModal || showQueueErrorModal || showBlurredResult;

  return (
    <>
      <Dialog open={isOpen && !isStacked} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent fullscreen className="bg-background">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {/* Template Preview */}
            <div className="flex max-h-[48dvh] min-h-0 w-full items-center justify-center bg-black">
              {isVideo ? (
                <AutoplayVideo
                  src={templateImage}
                  className="max-h-[48dvh] w-full object-contain"
                />
              ) : (
                <img 
                  src={templateImage}
                  alt={templateName}
                  className="max-h-[48dvh] w-full object-contain"
                />
              )}
            </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">{templateName}</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Faça upload da foto da pessoa que você deseja ver no vídeo
              </p>
            </div>


            {/* Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Selecione a foto da pessoa
              </label>
              
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-all duration-300
                  ${isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  ${previewUrl ? 'p-2' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="sr-only"
                  tabIndex={-1}
                />

                
                {previewUrl ? (
                  <div className="relative z-10">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelectedFile(null);
                        setPreviewUrl((prev) => {
                          if (prev) URL.revokeObjectURL(prev);
                          return null;
                        });
                      }}
                      className="absolute -top-2 -right-2 z-20 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Selecione uma foto</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        PNG, JPG, WEBP até 50MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-xs text-destructive text-center">{error}</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="w-full border-border py-6"
              >
                Fechar
              </Button>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConsentConfirmationModal
        isOpen={showConsent}
        imageUrl={previewUrl}
        alwaysConfirmPhoto
        onClose={() => setShowConsent(false)}
        onConfirm={() => {
          setShowConsent(false);
          setError(null);
          setShowLoadingModal(true);
        }}
      />

      <GenerationLoadingModal
        isOpen={showLoadingModal}
        onComplete={handleLoadingComplete}
      />

      <BlurredResultModal
        isOpen={showBlurredResult}
        onClose={() => setShowBlurredResult(false)}
        mediaSrc={templateImage}
        isVideo={isVideo}
        onContinue={() => {
          setShowBlurredResult(false);
          setTimeout(() => setShowCreditsModal(true), 260);
        }}
      />

      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={handleCreditsClose}
        onBuyCredits={handleBuyCredits}
        currentCredits={currentCredits}
        requiredCredits={GENERATION_COST}
        mediaType={isVideo ? "video" : "photo"}
      />

      <ExitDownsellModal
        isOpen={showDownsell}
        onClose={() => setShowDownsell(false)}
        onAccept={handleAcceptDownsell}
      />

      <QueueErrorModal
        isOpen={showQueueErrorModal}
        onClose={() => setShowQueueErrorModal(false)}
      />
    </>
  );
};

export default TemplateUploadModal;
