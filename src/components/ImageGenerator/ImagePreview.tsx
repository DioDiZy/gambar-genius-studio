
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
}

export const ImagePreview = ({ imageUrl, prompt, isGenerating, onSaved }: ImagePreviewProps) => {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!imageUrl || !prompt) {
      toast.error("Data tidak lengkap", { description: "Gambar dan prompt diperlukan untuk menyimpan" });
      return;
    }
    if (!user) {
      toast.error("Autentikasi diperlukan", { description: "Anda harus masuk untuk menyimpan gambar" });
      return;
    }
    try {
      setSaving(true);
      toast.info("Menyimpan gambar Anda...");
      await saveGeneratedImage(imageUrl, prompt, user.id);
      onSaved();
      toast.success("Gambar disimpan ke galeri Anda!");
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Kesalahan menyimpan gambar", {
        description: error instanceof Error ? error.message : "Silakan coba lagi"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `Gambar-AI-${Date.now()}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pratinjau Gambar</CardTitle>
        <CardDescription>Lihat hasil gambar yang dihasilkan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-muted/30 aspect-square">
          {isGenerating ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Membuat karya seni Anda...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-center text-muted-foreground">Gambar yang dihasilkan akan muncul di sini</p>
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={!imageUrl}>
              <Download className="h-4 w-4 mr-2" />
              Unduh
            </Button>
            <Button variant="default" className="flex-1" onClick={handleSave} disabled={saving || !imageUrl}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan ke Galeri"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
