
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateMultipleImages } from "@/services/ImageService";
import { handleParagraphSplit } from "@/utils/storyUtils";
import { StoryInputOptions } from "./StoryInputOptions";
import { StoryTextArea } from "./StoryTextArea";
import { StoryGenerationButton } from "./StoryGenerationButton";

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
  const [characterDescriptions, setCharacterDescriptions] = useState("");
  const { user } = useAuth();
  const [paragraphCount, setParagraphCount] = useState(0);

  // Update paragraph count whenever story or separator changes
  useEffect(() => {
    const paragraphs = handleParagraphSplit(story, paragraphSeparator);
    setParagraphCount(paragraphs.length);
  }, [story, paragraphSeparator]);

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
      const paragraphs = handleParagraphSplit(story, paragraphSeparator);
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
        // Generate images for each paragraph with consistent character descriptions
        const enhancedPrompts = paragraphs.map(p => {
          let enhancedPrompt = `${p} in ${style} style`;
          
          // Add character descriptions if provided
          if (characterDescriptions.trim()) {
            enhancedPrompt = `${enhancedPrompt}. Characters: ${characterDescriptions}`;
          }
          
          return enhancedPrompt;
        });
        
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
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Story to Images
        </CardTitle>
        <CardDescription>
          Write a story and generate an image for each paragraph
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StoryInputOptions
            paragraphSeparator={paragraphSeparator}
            onSeparatorChange={setParagraphSeparator}
            style={style}
            onStyleChange={setStyle}
            characterDescriptions={characterDescriptions}
            onCharacterDescriptionsChange={setCharacterDescriptions}
            isGenerating={isGenerating}
          />

          <Separator className="my-4" />

          <StoryTextArea
            story={story}
            onStoryChange={setStory}
            paragraphCount={paragraphCount}
            isGenerating={isGenerating}
          />

          <div className="flex items-center justify-end">
            <StoryGenerationButton
              onGenerate={handleGenerate}
              disabled={!story.trim()}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
