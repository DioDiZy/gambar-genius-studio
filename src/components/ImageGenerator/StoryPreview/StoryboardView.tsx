
import { Images } from "lucide-react";
import { Loader2 } from "lucide-react";

interface StoryboardViewProps {
  imageUrls: string[];
  prompts: string[];
  currentIndex: number;
  isGenerating: boolean;
  onSelectImage: (index: number) => void;
}

export const StoryboardView = ({
  imageUrls,
  prompts,
  currentIndex,
  isGenerating,
  onSelectImage,
}: StoryboardViewProps) => {
  const currentPrompt = prompts[currentIndex];

  return (
    <div className="rounded-2xl overflow-hidden bg-muted/20 border-2 border-border/50 p-4">
      {isGenerating ? (
        <div className="text-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="absolute -top-1 -right-1 text-xl animate-wiggle">🎬</span>
            </div>
            <div>
              <p className="text-kid-base font-medium text-foreground">Membuat storyboard...</p>
              <p className="text-kid-xs text-muted-foreground mt-1">Tunggu sebentar ya! ✨</p>
            </div>
          </div>
        </div>
      ) : imageUrls.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imageUrls.map((url, idx) => (
              <div 
                key={idx} 
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 hover:scale-[1.02] ${
                  idx === currentIndex 
                    ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' 
                    : 'border-border/50 hover:border-primary/40'
                }`}
                onClick={() => onSelectImage(idx)}
              >
                <img src={url} alt={`Adegan ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-1.5 right-1.5 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-kid-xs font-medium border border-border/50">
                  Adegan {idx + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <h4 className="font-semibold text-kid-xs text-muted-foreground mb-1">📖 Adegan {currentIndex + 1}</h4>
            <p className="text-kid-sm leading-relaxed">{currentPrompt}</p>
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <Images className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-kid-base font-medium text-foreground">Storyboard-mu akan muncul di sini</p>
          <p className="text-kid-xs text-muted-foreground mt-1">
            Tulis cerita dan klik tombol buat gambar! 🎬
          </p>
        </div>
      )}
    </div>
  );
};
