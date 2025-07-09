
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { Textarea } from "@/components/ui/textarea";
import { generateImage } from "@/services/ImageService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GeneratorFormProps {
  onImageGenerated: (url: string, prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const GeneratorForm = ({ 
  onImageGenerated, 
  isGenerating,
  setIsGenerating
}: GeneratorFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      // First check if user has enough credits
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user?.id)
        .single();

      if (profileError) {
        throw new Error("Could not check available credits");
      }

      if (!profile || profile.credits <= 0) {
        toast.error("Not enough credits", {
          description: "You need credits to generate images"
        });
        return;
      }

      setIsGenerating(true);
      
      toast.info("Generating your image...", {
        description: "This may take a few moments"
      });
      
      try {
        // Include the style in the prompt for better results
        const enhancedPrompt = `${prompt} in ${style} style`;
        const imageUrl = await generateImage({ 
          prompt: enhancedPrompt, 
          aspectRatio 
        });
        
        if (imageUrl) {
          onImageGenerated(imageUrl, prompt);
          toast.success("Image generated successfully!");
        } else {
          toast.error("Failed to generate image");
        }
      } catch (error) {
        console.error("Error generating image:", error);
        
        // Check for billing error
        if (error instanceof Error && error.message.includes("Billing required")) {
          toast.error("Replicate API requires billing", {
            description: "Please visit replicate.com/account/billing to set up billing for your account.",
            action: {
              label: "Visit Billing",
              onClick: () => window.open("https://replicate.com/account/billing", "_blank")
            }
          });
        } else {
          toast.error("Error generating image", {
            description: error instanceof Error ? error.message : "Please try again"
          });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Prompt</CardTitle>
        <CardDescription>
          Describe the image you want to generate in detail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="A futuristic city with flying cars and neon lights, cyberpunk style, 8k, detailed..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-32 mb-4"
          disabled={isGenerating}
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Style</label>
            <select 
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isGenerating}
            >
              <option value="photorealistic">Photorealistic</option>
              <option value="digital-art">Digital Art</option>
              <option value="anime">Anime</option>
              <option value="3d-render">3D Render</option>
              <option value="oil-painting">Oil Painting</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Aspect Ratio</label>
            <select 
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={isGenerating}
            >
              <option value="1:1">Square (1:1)</option>
              <option value="16:9">Landscape (16:9)</option>
              <option value="9:16">Portrait (9:16)</option>
              <option value="4:3">Standard (4:3)</option>
            </select>
          </div>
        </div>
        <CustomButton
          variant="gradient"
          className="w-full"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </CustomButton>
      </CardContent>
    </Card>
  );
};
