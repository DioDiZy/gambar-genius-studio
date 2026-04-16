
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface SingleImageViewProps {
  imageUrls: string[];
  prompts: string[];
  currentIndex: number;
  isGenerating: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const SingleImageView = ({
  imageUrls,
  prompts,
  currentIndex,
  isGenerating,
  onPrevious,
  onNext,
}: SingleImageViewProps) => {
  const currentImage = imageUrls[currentIndex];
  const currentPrompt = prompts[currentIndex];

  return (
    <div className="rounded-2xl overflow-hidden bg-muted/20 border-2 border-border/50 aspect-square flex items-center justify-center">
      {isGenerating ? (
        <div className="text-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="absolute -top-1 -right-1 text-xl animate-wiggle">🎨</span>
            </div>
            <div>
              <p className="text-kid-base font-medium text-foreground">Sedang membuat gambar...</p>
              <p className="text-kid-xs text-muted-foreground mt-1">Tunggu sebentar ya! ✨</p>
            </div>
          </div>
        </div>
      ) : imageUrls.length > 0 ? (
        <div className="relative w-full h-full">
          <img 
            src={currentImage} 
            alt={`Dihasilkan dari: ${currentPrompt}`} 
            className="w-full h-full object-cover"
          />
          {imageUrls.length > 1 && (
            <>
              <button 
                onClick={onPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-border/50 hover:scale-110 transition-transform"
                aria-label="Gambar sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={onNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-border/50 hover:scale-110 transition-transform"
                aria-label="Gambar berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-kid-xs font-medium border border-border/50">
                Adegan {currentIndex + 1} dari {imageUrls.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center p-8">
          <div className="text-5xl mb-3 animate-bounce-gentle">🖼️</div>
          <p className="text-kid-base font-medium text-foreground">Gambarmu akan muncul di sini</p>
          <p className="text-kid-xs text-muted-foreground mt-1">
            Tulis cerita dan klik tombol buat gambar! 🚀
          </p>
        </div>
      )}
    </div>
  );
};
