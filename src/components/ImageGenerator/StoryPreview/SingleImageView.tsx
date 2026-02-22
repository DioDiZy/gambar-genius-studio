
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="border rounded-lg overflow-hidden bg-muted/30 aspect-square flex items-center justify-center">
      {isGenerating ? (
        <div className="text-center p-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Membuat karya seni Anda...</p>
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow-md"
                aria-label="Gambar sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow-md"
                aria-label="Gambar berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-xs">
                {currentIndex + 1} / {imageUrls.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center p-6">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-muted-foreground text-sm">
            Gambar yang dihasilkan akan muncul di sini
          </p>
        </div>
      )}
    </div>
  );
};
