
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { Textarea } from "@/components/ui/textarea";
import { generateMultipleImages } from "@/services/ImageService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StoryGeneratorProps {
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const StoryGenerator = ({ 
  onImagesGenerated, 
  isGenerating,
  setIsGenerating
}: StoryGeneratorProps) => {
  const [story, setStory] = useState("");
  const [paragraphSeparator, setParagraphSeparator] = useState("\n\n");
  const [style, setStyle] = useState("photorealistic");
  const { user } = useAuth();

  const handleParagraphSplit = (text: string): string[] => {
    // Handle both types of line breaks and split by empty lines
    if (!text.trim()) return [];
    
    // Use the custom separator if it exists, otherwise default to double newline
    const separator = paragraphSeparator || "\n\n";
    const paragraphs = text.split(separator)
      .map(p => p.trim())
      .filter(p => p.length > 0);
      
    return paragraphs;
  };

  const handleGenerate = async () => {
    if (!story.trim()) {
      toast.error("Please enter a story");
      return;
    }

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

      // Get paragraphs
      const paragraphs = handleParagraphSplit(story);
      const totalImages = paragraphs.length;

      if (totalImages === 0) {
        toast.error("No valid paragraphs found");
        return;
      }

      if (!profile || profile.credits < totalImages) {
        toast.error("Not enough credits", {
          description: `You need ${totalImages} credits to generate images for all paragraphs`
        });
        return;
      }

      setIsGenerating(true);
      
      toast.info(`Generating ${totalImages} images...`, {
        description: "This may take a few moments"
      });
      
      try {
        // Generate images for each paragraph
        const enhancedPrompts = paragraphs.map(p => `${p} in ${style} style`);
        const imageUrls = await generateMultipleImages(enhancedPrompts);
        
        if (imageUrls.length > 0) {
          onImagesGenerated(imageUrls, paragraphs);
          toast.success(`Generated ${imageUrls.length} images successfully!`);
        } else {
          toast.error("Failed to generate images");
        }
      } catch (error) {
        console.error("Error generating images:", error);
        
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
          toast.error("Error generating images", {
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
        <CardTitle>Story to Images</CardTitle>
        <CardDescription>
          Write a story and generate an image for each paragraph
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Paragraph Separator</Label>
            <Input 
              placeholder="Enter the separator between paragraphs"
              value={paragraphSeparator}
              onChange={(e) => setParagraphSeparator(e.target.value)}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Default is double line break. Enter custom separators like "***" or "###" if needed.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Style</Label>
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

          <Separator className="my-4" />

          <Textarea
            placeholder="Once upon a time in a distant land...\n\nAs the hero ventured deeper into the forest..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="min-h-64 mb-4"
            disabled={isGenerating}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {handleParagraphSplit(story).length} paragraphs detected
            </p>
            <CustomButton
              variant="gradient"
              onClick={handleGenerate}
              disabled={!story.trim() || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Images"}
            </CustomButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
