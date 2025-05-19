
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveGeneratedImage } from "@/services/ImageService";

interface UseStoryImagesProps {
  onSaved: () => void;
}

export const useStoryImages = ({ onSaved }: UseStoryImagesProps) => {
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

  const handleDownloadAll = (imageUrls: string[]) => {
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

  const handleNext = (length: number) => {
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const handlePrevious = (length: number) => {
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  const handleSelectImage = (index: number) => {
    setCurrentIndex(index);
  };

  return {
    currentIndex,
    setCurrentIndex,
    saving,
    viewMode,
    setViewMode,
    handleSave,
    handleDownload,
    handleDownloadAll,
    handleNext,
    handlePrevious,
    handleSelectImage
  };
};
