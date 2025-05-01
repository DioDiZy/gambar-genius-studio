
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { saveGeneratedImage } from "@/services/ImageService";
import { toast } from "sonner";

interface ImagePreviewProps {
  imageUrl: string;
  isGenerating: boolean;
  onSaved: () => void;
}

export const ImagePreview = ({ imageUrl, isGenerating, onSaved }: ImagePreviewProps) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!imageUrl) return;
    
    try {
      setSaving(true);
      toast.info("Saving your image...");
      
      await saveGeneratedImage(imageUrl, "");
      
      // Notify parent component to refetch images
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
    link.download = "generated-image.webp";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Image</CardTitle>
        <CardDescription>
          Your AI-generated image will appear here
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-muted/30 aspect-square flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center p-6">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Creating your masterpiece...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-muted-foreground text-sm">
                Your generated image will appear here
              </p>
            </div>
          )}
        </div>
        {imageUrl && (
          <div className="flex justify-between mt-4">
            <CustomButton 
              variant="outline" 
              size="sm"
              onClick={() => handleDownload(imageUrl)}
            >
              Download
            </CustomButton>
            <CustomButton 
              variant="gradient" 
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save to Gallery"}
            </CustomButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
