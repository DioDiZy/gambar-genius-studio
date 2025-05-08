
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { saveGeneratedImage } from "@/services/ImageService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Download, Save } from "lucide-react";

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

  // Getting the current image and prompt
  const currentImage = imageUrls[currentIndex];
  const currentPrompt = prompts[currentIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Images {imageUrls.length > 0 ? `(${currentIndex + 1}/${imageUrls.length})` : ""}</CardTitle>
        <CardDescription>
          Images generated from your story paragraphs
        </CardDescription>
      </CardHeader>
      <CardContent>
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

        {imageUrls.length > 0 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              Prompt: {currentPrompt}
            </p>
            <div className="flex justify-between">
              <CustomButton 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload(currentImage)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </CustomButton>
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
