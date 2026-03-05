
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateMultipleImages } from "@/services/ImageService";
import { handleParagraphSplit } from "@/utils/storyUtils";
import { validateIndonesianSentence } from "@/utils/indonesianLanguageValidation";
import { CharacterDescription } from "@/types/story";
import { createStructuredStoryboardPrompts } from "@/services/StoryboardService";

// Define this type to be consistent with StoryGenerator component
type SupportedLanguage = "english" | "indonesian";

interface UseStoryGenerationProps {
  story: string;
  paragraphSeparator: string;
  style: string;
  characterDescriptions: string;
  characters: CharacterDescription[];
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  onStructuredDataGenerated?: (structuredData: any) => void;
  language: SupportedLanguage;
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
  onStructuredDataGenerated,
  language
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

    if (language === "indonesian") {
      const validation = validateIndonesianSentence(story);
      if (!validation.isLikelyIndonesianSentence) {
        toast.error("Teks terdeteksi bukan kalimat Indonesia yang natural", {
          description: validation.reasons[0] ?? "Silakan periksa kembali kata dan struktur kalimat Anda"
        });
        return;
      }
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
        description: language === "indonesian" 
          ? "Menerjemahkan teks Indonesia ke bahasa Inggris untuk hasil yang lebih baik"
          : "Translating Indonesian text to English for better results"
      });
      
      try {
        // Generate enhanced storyboard prompts with visual continuity and structured data
        console.log("Creating structured storyboard prompts with enhanced continuity...");
        const structuredResult = await createStructuredStoryboardPrompts(
          paragraphs,
          characters,
          style,
          characterDescriptions,
          language
        );
        
        const enhancedPrompts = structuredResult.prompts;
        
        // Pass structured data to callback if provided
        if (onStructuredDataGenerated) {
          onStructuredDataGenerated(structuredResult);
        }
        
        console.log("Enhanced storyboard prompts generated:", enhancedPrompts);
        
        const imageUrls = await generateMultipleImages(enhancedPrompts, style);
        
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
