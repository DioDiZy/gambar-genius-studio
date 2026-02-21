import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Palette, User, Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateMultipleImages } from "@/services/ImageService";
import {
  storyboardTemplates,
  buildPromptsFromTemplate,
  type StoryboardTemplate,
} from "@/data/storyboardTemplates";

interface TemplateStoryboardProps {
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

export const TemplateStoryboard = ({
  onImagesGenerated,
  isGenerating,
  setIsGenerating,
}: TemplateStoryboardProps) => {
  const { user } = useAuth();
  const [selectedTemplate] = useState<StoryboardTemplate>(storyboardTemplates[0]);
  const [characterDescription, setCharacterDescription] = useState("");
  const [characterOutfit, setCharacterOutfit] = useState("");

  const totalFrames = selectedTemplate.story_frames.length;

  const handleGenerate = async () => {
    if (!characterDescription.trim()) {
      toast.error("Masukkan deskripsi karakter / Enter character description");
      return;
    }
    if (!characterOutfit.trim()) {
      toast.error("Masukkan pakaian karakter / Enter character outfit");
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user?.id)
        .single();

      if (profileError) throw new Error("Could not check available credits");

      if (!profile || profile.credits < totalFrames) {
        toast.error("Kredit tidak cukup", {
          description: `Anda membutuhkan ${totalFrames} kredit untuk menghasilkan ${totalFrames} frame storyboard`,
        });
        return;
      }

      setIsGenerating(true);
      toast.info(`Menghasilkan ${totalFrames} frame storyboard...`, {
        description: "Generating with Pixar/Disney 3D style template",
      });

      const { prompts, frameTitles } = buildPromptsFromTemplate(
        selectedTemplate,
        characterDescription,
        characterOutfit
      );

      console.log("Template prompts:", prompts);

      const imageUrls = await generateMultipleImages(prompts);

      if (imageUrls.length > 0) {
        onImagesGenerated(imageUrls, frameTitles);
        toast.success(`Berhasil menghasilkan ${imageUrls.length} frame!`);
      } else {
        toast.error("Gagal menghasilkan gambar");
      }
    } catch (error) {
      console.error("Template generation error:", error);
      if (error instanceof Error && error.message.includes("Billing required")) {
        toast.error("Replicate API requires billing", {
          description: "Please visit replicate.com/account/billing",
          action: {
            label: "Visit Billing",
            onClick: () => window.open("https://replicate.com/account/billing", "_blank"),
          },
        });
      } else {
        toast.error("Error generating images", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {selectedTemplate.template_name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Palette className="h-3 w-3 mr-1" />
            Pixar / Disney 3D Style
          </Badge>
          <Badge variant="outline" className="text-xs">
            {selectedTemplate.target_audience}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {totalFrames} Frame
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Character Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Deskripsi Karakter / Character Description
            </Label>
            <Textarea
              placeholder="Contoh: A 10-year-old Indonesian girl with long black hair, brown eyes, round face, light brown skin"
              value={characterDescription}
              onChange={(e) => setCharacterDescription(e.target.value)}
              disabled={isGenerating}
              className="min-h-20"
            />
            <p className="text-xs text-muted-foreground">
              Deskripsikan wajah, rambut, warna kulit, usia karakter utama secara detail.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Pakaian Karakter / Character Outfit
            </Label>
            <Input
              placeholder="Contoh: a bright red cloak, white dress, and brown leather boots"
              value={characterOutfit}
              onChange={(e) => setCharacterOutfit(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>

        <Separator />

        {/* Frame Preview */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Alur Cerita / Story Flow</Label>
          <div className="grid grid-cols-2 gap-3">
            {selectedTemplate.story_frames.map((frame) => (
              <div
                key={frame.frame_id}
                className="rounded-lg border border-border bg-muted/30 p-3 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {frame.frame_id}
                  </span>
                  <span className="font-medium text-sm">{frame.title_id}</span>
                </div>
                <p className="text-xs text-muted-foreground">{frame.instruction_id}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            onClick={handleGenerate}
            disabled={!characterDescription.trim() || !characterOutfit.trim() || isGenerating}
            className="gap-2"
            size="lg"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Menghasilkan..." : `Hasilkan ${totalFrames} Frame`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
