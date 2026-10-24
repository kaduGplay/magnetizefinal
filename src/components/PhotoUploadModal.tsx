import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, X, Clapperboard } from "lucide-react";
import ConsentConfirmationModal from "@/components/ConsentConfirmationModal";
import AutoplayVideo from "@/components/AutoplayVideo";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (file: File) => void;
  selectedVideoUrl?: string | null;
}

const PhotoUploadModal = ({ isOpen, onClose, onContinue, selectedVideoUrl }: PhotoUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const clearImage = () => {
    setSelectedFile(null);
    setShowConsent(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    clearImage();
    setError(null);
    onClose();
  };

  const handleRemoveImage = () => {
    clearImage();
  };

  return (
    <>
    <Dialog open={isOpen && !showConsent} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="isolate max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto border-border/60 bg-background p-0 sm:p-0 [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-background/80 [&>button]:p-2 [&>button]:text-foreground [&>button]:opacity-100">
        <div className="relative isolate mx-auto flex min-h-[380px] w-full flex-col overflow-hidden">
          {selectedVideoUrl ? (
            <div className="relative w-full">
                <div className="relative isolate h-[clamp(240px,40dvh,340px)] w-full overflow-hidden">
                  <AutoplayVideo
                    src={selectedVideoUrl}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-40 blur-xl"
                  />
                  <div className="pointer-events-none absolute inset-0 -z-10 bg-background/30" />
                  <AutoplayVideo
                    src={selectedVideoUrl}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-background to-transparent" />
                </div>
                <div className="bg-background px-6 py-3 text-center">
                  <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Clapperboard className="h-3.5 w-3.5" />
                    Template escolhido
                  </p>
                </div>
            </div>
          ) : (
            <div className="h-14" />
          )}

          <div className="bg-background px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="mb-5 text-center">
            <DialogTitle className="mb-2 text-2xl font-bold tracking-normal text-foreground">
              Gere vídeos com fotos da galeria
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/80">
              Selecione a foto da pessoa
            </DialogDescription>
          </div>

          {/* Upload Area */}
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border border-dashed rounded-xl p-5 cursor-pointer transition-colors duration-300 min-h-[150px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isDragOver
                ? "border-primary bg-primary/10"
                : previewUrl
                ? "border-primary/50 bg-primary/5"
                : "border-primary/40 hover:border-primary bg-primary/5"
            }`}
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
              <div className="relative z-10 w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[300px] object-contain rounded-xl"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remover foto"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 z-20 bg-background/80 hover:bg-background rounded-full"
                >
                  <X className="h-4 w-4 text-foreground" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <p className="text-foreground font-semibold mb-1">
                  Selecione a foto da pessoa
                </p>
                <p className="text-foreground/70 text-sm">
                  Clique aqui ou arraste uma imagem
                </p>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-3 text-xs text-destructive text-center">{error}</p>
          )}

          {selectedFile && previewUrl && (
            <Button
              className="mt-4 h-12 w-full font-bold"
              onClick={() => {
                if (selectedFile) onContinue(selectedFile);
              }}
            >
              Gerar com essa foto
            </Button>
          )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
    <ConsentConfirmationModal
      isOpen={isOpen && showConsent}
      imageUrl={previewUrl}
      alwaysConfirmPhoto
      onClose={() => setShowConsent(false)}
      onConfirm={() => {
        if (!selectedFile) return;
        setShowConsent(false);
        onContinue(selectedFile);
      }}
    />
    </>
  );
};

export default PhotoUploadModal;
