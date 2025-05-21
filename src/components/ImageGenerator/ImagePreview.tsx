
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveGeneratedImage } from "@/services/ImageService";

interface ImagePreviewProps {
  imageUrl: string;
  prompt: string;
  isGenerating: boolean;
  onSaved: () => void;
  language?: "english" | "indonesian";
}

export const ImagePreview = ({ imageUrl, prompt, isGenerating, onSaved, language = "english" }: ImagePreviewProps) => {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!imageUrl || !prompt) {
      toast.error(
        language === "indonesian" ? "Data tidak lengkap" : "Missing data",
        { 
          description: language === "indonesian" 
            ? "Gambar dan prompt diperlukan untuk menyimpan" 
            : "Both image and prompt are required to save" 
        }
      );
      return;
    }

    if (!user) {
      toast.error(
        language === "indonesian" ? "Autentikasi diperlukan" : "Authentication required",
        {
          description: language === "indonesian" 
            ? "Anda harus masuk untuk menyimpan gambar" 
            : "You must be logged in to save images"
        }
      );
      return;
    }
    
    try {
      setSaving(true);
      toast.info(language === "indonesian" ? "Menyimpan gambar Anda..." : "Saving your image...");
      
      await saveGeneratedImage(imageUrl, prompt, user.id);
      
      onSaved();
      
      toast.success(
        language === "indonesian" 
          ? "Gambar disimpan ke galeri Anda!" 
          : "Image saved to your gallery!"
      );
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error(
        language === "indonesian" ? "Kesalahan menyimpan gambar" : "Error saving image",
        {
          description: error instanceof Error ? error.message : "Please try again"
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `AI-image-${Date.now()}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === "indonesian" ? "Pratinjau Gambar" : "Image Preview"}</CardTitle>
        <CardDescription>
          {language === "indonesian" 
            ? "Lihat hasil gambar yang dihasilkan" 
            : "View your generated image result"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-muted/30 aspect-square">
          {isGenerating ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">
                  {language === "indonesian" 
                    ? "Membuat karya seni Anda..." 
                    : "Creating your masterpiece..."}
                </p>
              </div>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt={prompt} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-center text-muted-foreground">
                {language === "indonesian" 
                  ? "Gambar yang dihasilkan akan muncul di sini" 
                  : "Your generated image will appear here"}
              </p>
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDownload}
              disabled={!imageUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              {language === "indonesian" ? "Unduh" : "Download"}
            </Button>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !imageUrl}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving 
                ? (language === "indonesian" ? "Menyimpan..." : "Saving...") 
                : (language === "indonesian" ? "Simpan ke Galeri" : "Save to Gallery")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
