
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { saveGeneratedImage } from "@/services/ImageService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Save, 
  BookText, 
  Bookmark,
  BookOpen,
  Images
} from "lucide-react";

interface StoryImagesPreviewProps {
  imageUrls: string[];
  prompts: string[];
  isGenerating: boolean;
  onSaved: () => void;
}

export const StoryImagesPreview = ({ 
  imageUrls, 
  prompts, 
  isGenerating, 
  onSaved 
}: StoryImagesPreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'storyboard'>('storyboard');
  const { user } = useAuth();

  const handleSave = async (imageUrl: string, prompt: string) => {
    if (!imageUrl || !prompt) {
      toast.error("Missing data", { 
        description: "Both image and prompt are required to save" 
      });
      return;
    }

    if (!user) {
      toast.error("Authentication required", {
        description: "You must be logged in to save images"
      });
      return;
    }
    
    try {
      setSaving(true);
      toast.info("Saving your image...");
      
      await saveGeneratedImage(imageUrl, prompt, user.id);
      
      onSaved();
      
      toast.success("Image saved to your gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Error saving image", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `story-image-${currentIndex + 1}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleDownloadAll = () => {
    imageUrls.forEach((url, index) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = `story-image-${index + 1}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    toast.success(`Downloaded ${imageUrls.length} images`);
  };

  // Getting the current image and prompt
  const currentImage = imageUrls[currentIndex];
  const currentPrompt = prompts[currentIndex];

  const renderSingleView = () => (
    <div className="border rounded-lg overflow-hidden bg-muted/30 aspect-square flex items-center justify-center">
      {isGenerating ? (
        <div className="text-center p-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Creating your masterpieces...</p>
          </div>
        </div>
      ) : imageUrls.length > 0 ? (
        <div className="relative w-full h-full">
          <img 
            src={currentImage} 
            alt={`Generated from: ${currentPrompt}`} 
            className="w-full h-full object-cover"
          />
          {imageUrls.length > 1 && (
            <>
              <button 
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow-md"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow-md"
                aria-label="Next image"
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
            Your generated images will appear here
          </p>
        </div>
      )}
    </div>
  );

  const renderStoryboardView = () => (
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
                onClick={() => setCurrentIndex(idx)}
              >
                <img 
                  src={url} 
                  alt={`Scene ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-background/80 px-2 py-0.5 rounded text-xs font-medium">
                  Scene {idx + 1}
                </div>
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BookText className="h-5 w-5" />
            Story Images {imageUrls.length > 0 ? `(${currentIndex + 1}/${imageUrls.length})` : ""}
          </CardTitle>
          {imageUrls.length > 0 && (
            <div className="flex space-x-1 bg-muted/30 p-1 rounded-md">
              <button 
                onClick={() => setViewMode('single')} 
                className={`p-1 rounded ${viewMode === 'single' ? 'bg-background' : ''}`}
                title="Single view"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('storyboard')} 
                className={`p-1 rounded ${viewMode === 'storyboard' ? 'bg-background' : ''}`}
                title="Storyboard view"
              >
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <CardDescription>
          Storyboard images generated from your story paragraphs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {viewMode === 'single' ? renderSingleView() : renderStoryboardView()}

        {imageUrls.length > 0 && (
          <div className="mt-4 space-y-4">
            {viewMode === 'single' && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                Prompt: {currentPrompt}
              </p>
            )}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <CustomButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(currentImage)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </CustomButton>
                {imageUrls.length > 1 && (
                  <CustomButton
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadAll}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </CustomButton>
                )}
              </div>
              <CustomButton 
                variant="gradient" 
                size="sm"
                onClick={() => handleSave(currentImage, currentPrompt)}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save to Gallery"}
              </CustomButton>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
