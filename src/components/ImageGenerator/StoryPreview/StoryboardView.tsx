
import { Images } from "lucide-react";

interface StoryboardViewProps {
  imageUrls: string[];
  prompts: string[];
  currentIndex: number;
  isGenerating: boolean;
  confidenceScores?: number[]; // Added confidence scores prop
  onSelectImage: (index: number) => void;
}

export const StoryboardView = ({
  imageUrls,
  prompts,
  currentIndex,
  isGenerating,
  confidenceScores,
  onSelectImage,
}: StoryboardViewProps) => {
  const currentPrompt = prompts[currentIndex];

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/30 p-4">
      {isGenerating ? (
        <div className="text-center p-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Creating your storyboard...</p>
          </div>
        </div>
      ) : imageUrls.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {imageUrls.map((url, idx) => (
              <div 
                key={idx} 
                className={`relative aspect-square border-2 rounded overflow-hidden cursor-pointer transition-all ${
                  idx === currentIndex ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-transparent'
                }`}
                onClick={() => onSelectImage(idx)}
              >
                <img 
                  src={url} 
                  alt={`Scene ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-background/80 px-2 py-0.5 rounded text-xs font-medium">
                  Scene {idx + 1}
                </div>
                {confidenceScores?.[idx] !== undefined && (
                  <div className="absolute top-1 left-1 bg-background/80 px-2 py-0.5 rounded text-xs font-medium">
                    {Math.round(confidenceScores[idx] * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-3 bg-muted/20 rounded-md border text-sm overflow-y-auto max-h-28">
            <h4 className="font-medium text-xs uppercase text-muted-foreground mb-1">Scene {currentIndex + 1}</h4>
            <p className="text-sm leading-relaxed">{currentPrompt}</p>
          </div>
        </div>
      ) : (
        <div className="text-center p-6">
          <Images className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground text-sm">
            Your storyboard will appear here
          </p>
        </div>
      )}
    </div>
  );
};
