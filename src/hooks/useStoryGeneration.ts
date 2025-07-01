
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateMultipleImages } from "@/services/ImageService";
import { handleParagraphSplit } from "@/utils/storyUtils";
import { CharacterDescription } from "@/types/story";
import { validateStoryContent } from "@/utils/contentFilter";
import { CLIPEnhancedService } from "@/services/CLIPEnhancedService";
import { IndonesianNLPService } from "@/services/IndonesianNLPService";

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
      toast.error(
        language === "indonesian" ? "Mohon masukkan cerita" : "Please enter a story"
      );
      return;
    }

    // Enhanced validation with better error messages for children
    const contentValidation = validateStoryContent(story, paragraphSeparator, language);
    if (!contentValidation.isAppropriate) {
      toast.error(
        language === "indonesian" ? "Cerita Tidak Sesuai untuk Anak" : "Story Not Suitable for Children",
        {
          description: contentValidation.reason,
          duration: 6000
        }
      );
      return;
    }

    // Also validate character descriptions if provided
    if (characterDescriptions.trim()) {
      const characterValidation = validateStoryContent(characterDescriptions, '\n', language);
      if (!characterValidation.isAppropriate) {
        toast.error(
          language === "indonesian" ? "Deskripsi Karakter Tidak Sesuai" : "Character Description Not Appropriate",
          {
            description: characterValidation.reason,
            duration: 5000
          }
        );
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
        toast.error(
          language === "indonesian" ? "Tidak ada paragraf yang valid ditemukan" : "No valid paragraphs found"
        );
        return;
      }

      if (!profile || profile.credits < totalImages) {
        toast.error(
          language === "indonesian" ? "Kredit tidak cukup" : "Not enough credits", 
          {
            description: language === "indonesian"
              ? `Anda memerlukan ${totalImages} kredit untuk membuat gambar dari semua paragraf`
              : `You need ${totalImages} credits to generate images for all paragraphs`
          }
        );
        return;
      }

      setIsGenerating(true);
      
      toast.info(
        language === "indonesian" 
          ? `Memproses dengan teknologi CLIP dan NLP Indonesia untuk ${totalImages} gambar berkualitas tinggi...` 
          : `Processing with CLIP technology and Indonesian NLP for ${totalImages} high-quality images...`, 
        {
          description: language === "indonesian"
            ? "Mengoptimalkan akurasi bahasa Indonesia untuk hasil yang lebih sesuai"
            : "Optimizing Indonesian language accuracy for better results"
        }
      );
      
      try {
        // Generate enhanced prompts using Indonesian NLP and CLIP optimization
        const enhancedPrompts = paragraphs.map(paragraph => {
          // Start with child-safety context
          const childSafetyContext = language === "indonesian"
            ? "Gambar ramah anak, sesuai untuk semua umur, tidak ada konten dewasa, "
            : "Child-friendly image, suitable for all ages, no adult content, ";
          
          let enhancedPrompt = childSafetyContext + paragraph;
          
          // Apply Indonesian NLP processing if Indonesian language is selected
          if (language === "indonesian") {
            console.log("Applying Indonesian NLP processing to paragraph:", paragraph);
            
            const nlpResult = IndonesianNLPService.processIndonesianPrompt(paragraph);
            console.log("NLP processed result:", nlpResult);
            
            // Use the NLP-enhanced prompt as base
            enhancedPrompt = childSafetyContext + nlpResult.enhancedPrompt;
            
            // Apply CLIP optimization
            const clipEnhanced = CLIPEnhancedService.enhancePromptWithCLIP(
              enhancedPrompt,
              style,
              language
            );
            
            console.log("CLIP enhanced prompt:", clipEnhanced.clipOptimizedPrompt);
            enhancedPrompt = clipEnhanced.clipOptimizedPrompt;
          }
          
          // Build character consistency block
          if (characters.length > 0) {
            const characterPrefix = language === "indonesian" 
              ? ". Karakter dalam cerita: "
              : ". Characters in scene: ";
            enhancedPrompt += characterPrefix;
            
            const characterPrompts = characters.map(char => {
              const consistencyNote = language === "indonesian"
                ? "penampilan konsisten di semua adegan"
                : "consistent appearance throughout all scenes";
              return `${char.name} (${char.appearance}, ${consistencyNote})`;
            }).join('; ');
            
            enhancedPrompt += characterPrompts;
          }
          
          // Add additional scene details if provided
          if (characterDescriptions.trim()) {
            const detailPrefix = language === "indonesian"
              ? ". Detail adegan tambahan: "
              : ". Additional scene details: ";
            enhancedPrompt += `${detailPrefix}${characterDescriptions}`;
          }
          
          return enhancedPrompt;
        });
        
        console.log("Final enhanced prompts for image generation:", enhancedPrompts);
        
        // Generate images with enhanced prompts
        const imageUrls = await generateMultipleImages(enhancedPrompts, language, style);
        
        if (imageUrls.length > 0) {
          onImagesGenerated(imageUrls, paragraphs);
          toast.success(
            language === "indonesian"
              ? `Berhasil membuat ${imageUrls.length} gambar berkualitas tinggi dengan teknologi CLIP dan NLP Indonesia!`
              : `Generated ${imageUrls.length} high-quality images with CLIP and Indonesian NLP technology!`
          );
        } else {
          toast.error(
            language === "indonesian" ? "Gagal membuat gambar" : "Failed to generate images"
          );
        }
      } catch (error) {
        console.error("Error generating images:", error);
        
        // Check for billing error
        if (error instanceof Error && error.message.includes("Billing required")) {
          toast.error(
            language === "indonesian" 
              ? "Replicate API memerlukan penagihan" 
              : "Replicate API requires billing",
            {
              description: language === "indonesian"
                ? "Silakan kunjungi replicate.com/account/billing untuk mengatur penagihan untuk akun Anda."
                : "Please visit replicate.com/account/billing to set up billing for your account.",
              action: {
                label: language === "indonesian" ? "Kunjungi Penagihan" : "Visit Billing",
                onClick: () => window.open("https://replicate.com/account/billing", "_blank")
              }
            }
          );
        } else {
          toast.error(
            language === "indonesian" ? "Kesalahan membuat gambar" : "Error generating images",
            {
              description: error instanceof Error ? error.message : "Please try again"
            }
          );
        }
      }
    } catch (error) {
      console.error("Error checking credits:", error);
      toast.error(
        language === "indonesian" ? "Kesalahan memeriksa kredit" : "Error checking credits",
        {
          description: error instanceof Error ? error.message : "Please try again"
        }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    paragraphs,
    handleGenerateImages
  };
};
