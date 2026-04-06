import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateImage } from "@/services/ImageService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface GeneratorFormProps {
  onImageGenerated: (url: string, prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const GeneratorForm = ({ onImageGenerated, isGenerating, setIsGenerating }: GeneratorFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const { user } = useAuth();

  const handleGenerateImage = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Masukkan prompt");
      return;
    }

    try {
      setIsGenerating(true);
      toast.info("Membuat gambar...", { description: "Ini mungkin memerlukan beberapa saat" });

      try {
        const imageUrl = await generateImage({ prompt, aspectRatio, language: "indonesian" });

        if (imageUrl) {
          onImageGenerated(imageUrl, prompt);
          toast.success("Gambar berhasil dibuat!");
        } else {
          toast.error("Gagal membuat gambar");
        }
      } catch (error) {
        console.error("Error generating image:", error);

        if (error instanceof Error && error.message.includes("Billing required")) {
          toast.error("Replicate API memerlukan penagihan", {
            description: "Silakan kunjungi replicate.com/account/billing untuk mengatur penagihan.",
            action: {
              label: "Kunjungi Penagihan",
              onClick: () => window.open("https://replicate.com/account/billing", "_blank"),
            },
          });
        } else {
          toast.error("Kesalahan membuat gambar", {
            description: error instanceof Error ? error.message : "Silakan coba lagi",
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan", {
        description: error instanceof Error ? error.message : "Silakan coba lagi",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Gambar AI</CardTitle>
        <CardDescription>Masukkan prompt terperinci untuk membuat gambar AI sesuai dengan keinginan Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt Anda</Label>
            <Textarea
              id="prompt"
              placeholder="Misalnya: Kucing putih berbulu lebat duduk di taman yang indah, dengan bunga-bunga berwarna cerah di sekitarnya, gaya fotografi profesional"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32 resize-y"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aspectRatio">Rasio Aspek</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
              <SelectTrigger id="aspectRatio">
                <SelectValue placeholder="Pilih rasio aspek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">Kotak (1:1)</SelectItem>
                <SelectItem value="3:4">Potret (3:4)</SelectItem>
                <SelectItem value="4:3">Lanskap (4:3)</SelectItem>
                <SelectItem value="16:9">Lebar (16:9)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateImage} className="w-full mt-4" size="lg" disabled={!prompt.trim() || isGenerating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? "Sedang Membuat..." : "Buat Gambar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
