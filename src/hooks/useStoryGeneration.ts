
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateMultipleImages } from "@/services/ImageService";
import { handleParagraphSplit } from "@/utils/storyUtils";
import { CharacterDescription } from "@/types/story";
import { validateStoryContent } from "@/utils/contentFilter";

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
          ? `Membuat ${totalImages} gambar ramah anak...` 
          : `Generating ${totalImages} child-friendly images...`, 
        {
          description: language === "indonesian"
            ? "Ini mungkin memerlukan beberapa saat"
            : "This may take a few moments"
        }
      );
      
      try {
        // Generate images for each paragraph with enhanced child-safe prompts
        const enhancedPrompts = paragraphs.map(p => {
          // Create a base prompt that focuses on the scene from the paragraph
          let enhancedPrompt = p;
          
          // Add child-safety context first
          const childSafetyContext = language === "indonesian"
            ? "Gambar ramah anak, sesuai untuk semua umur, tidak ada konten dewasa, "
            : "Child-friendly image, suitable for all ages, no adult content, ";
          
          enhancedPrompt = childSafetyContext + enhancedPrompt;
          
          // Add detailed style information
          const styleMap: Record<string, string> = {
            "photorealistic": language === "indonesian" 
              ? "gaya foto realistis dengan detail yang indah dan pencahayaan yang baik"
              : "highly detailed photorealistic style with beautiful details and good lighting",
            "digital-art": language === "indonesian"
              ? "gaya seni digital dengan warna-warna cerah dan indah"
              : "vibrant digital art style with bright beautiful colors",
            "anime": language === "indonesian"
              ? "gaya anime dengan karakter yang lucu dan ekspresif"
              : "anime style with cute and expressive characters",
            "3d-render": language === "indonesian"
              ? "gaya render 3D dengan kedalaman dan material yang realistis"
              : "3D rendered style with depth and realistic materials",
            "oil-painting": language === "indonesian"
              ? "gaya lukisan minyak dengan tekstur yang indah"
              : "oil painting style with beautiful textures",
            "watercolor": language === "indonesian"
              ? "gaya cat air dengan perpaduan warna yang lembut"
              : "delicate watercolor style with soft color blending",
            "comic-book": language === "indonesian"
              ? "gaya komik dengan garis tegas dan warna cerah"
              : "comic book style with bold outlines and bright colors",
            "storybook-sketch": language === "indonesian"
              ? "gaya sketsa buku cerita dengan komposisi yang jelas"
              : "professional storybook sketch style with clear composition"
          };
          
          const styleDescription = styleMap[style] || styleMap["photorealistic"];
          enhancedPrompt = `${enhancedPrompt}, ${styleDescription}`;
          
          // Build a comprehensive character description block for consistency
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
          
          // Add additional image instructions if provided
          if (characterDescriptions.trim()) {
            const detailPrefix = language === "indonesian"
              ? ". Detail adegan: "
              : ". Scene details: ";
            enhancedPrompt += `${detailPrefix}${characterDescriptions}`;
          }
          
          // Add language-specific context
          if (language === "indonesian") {
            enhancedPrompt += ". Teks dalam bahasa Indonesia. Representasi visual harus sesuai dengan konteks budaya Indonesia yang ramah anak.";
          } else {
            enhancedPrompt += ". Child-friendly visual representation with appropriate cultural context.";
          }
          
          return enhancedPrompt;
        });
        
        console.log("Enhanced child-safe prompts for image generation:", enhancedPrompts);
        
        const imageUrls = await generateMultipleImages(enhancedPrompts);
        
        if (imageUrls.length > 0) {
          onImagesGenerated(imageUrls, paragraphs);
          toast.success(
            language === "indonesian"
              ? `Berhasil membuat ${imageUrls.length} gambar ramah anak!`
              : `Generated ${imageUrls.length} child-friendly images successfully!`
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
