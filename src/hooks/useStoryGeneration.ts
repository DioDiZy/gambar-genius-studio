
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateMultipleImages } from "@/services/ImageService";
import { handleParagraphSplit } from "@/utils/storyUtils";
import { CharacterDescription } from "@/types/story";

interface UseStoryGenerationProps {
  story: string;
  paragraphSeparator: string;
  style: string;
  characterDescriptions: string;
  characters: CharacterDescription[];
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  language?: string;
}

export const useStoryGeneration = ({
  story,
  paragraphSeparator,
  style,
  characterDescriptions,
  characters,
  isGenerating,
  setIsGenerating,
  onImagesGenerated,
  language = "english"
}: UseStoryGenerationProps) => {
  const { user } = useAuth();
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  // Update paragraphs whenever story or separator changes
  useEffect(() => {
    const processedParagraphs = handleParagraphSplit(story, paragraphSeparator);
    setParagraphs(processedParagraphs);
  }, [story, paragraphSeparator]);

  const handleGenerateImages = async () => {
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
          // Create a base prompt that focuses on the scene from the paragraph
          let enhancedPrompt = p;
          
          // Add detailed style information
          const styleMap: Record<string, string> = {
            "photorealistic": "highly detailed photorealistic style with realistic lighting and textures",
            "digital-art": "vibrant digital art style with rich colors",
            "anime": "anime style with clean lines and expressive characters",
            "3d-render": "3D rendered style with depth and realistic materials",
            "oil-painting": "oil painting style with visible brush strokes and rich textures",
            "watercolor": "delicate watercolor style with soft color blending",
            "comic-book": "comic book style with bold outlines and flat colors",
            "storyboard-sketch": "professional storyboard sketch style with clear scene composition"
          };
          
          const styleDescription = styleMap[style] || styleMap["photorealistic"];
          enhancedPrompt = `${enhancedPrompt}, ${styleDescription}`;
          
          // Build a comprehensive character description block for consistency
          if (characters.length > 0) {
            enhancedPrompt += ". Characters in scene: ";
            
            const characterPrompts = characters.map(char => {
              // Make the character description more detailed for consistency
              return `${char.name} (${char.appearance}, consistent appearance throughout all scenes)`;
            }).join('; ');
            
            enhancedPrompt += characterPrompts;
          }
          
          // Add additional image instructions if provided
          if (characterDescriptions.trim()) {
            enhancedPrompt += `. Scene details: ${characterDescriptions}`;
          }
          
          // Add language-specific context
          if (language === "indonesian") {
            enhancedPrompt += ". Text is in Indonesian language (Bahasa Indonesia). Visual representation should match Indonesian cultural context where appropriate.";
          }
          
          return enhancedPrompt;
        });
        
        console.log("Enhanced prompts for image generation:", enhancedPrompts);
        
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
    } catch (error) {
      console.error("Error checking credits:", error);
      toast.error("Error checking credits", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    paragraphs,
    handleGenerateImages
  };
};
