import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Languages, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateImage } from "@/services/ImageService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { filterContent, getChildFriendlyAlternatives } from "@/utils/contentFilter";
import { CLIPEnhancedService } from "@/services/CLIPEnhancedService";

interface GeneratorFormProps {
  onImageGenerated: (url: string, prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

// Define supported languages to match the Story Generator component
type SupportedLanguage = "english" | "indonesian";

export const GeneratorForm = ({
  onImageGenerated,
  isGenerating,
  setIsGenerating
}: GeneratorFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [language, setLanguage] = useState<SupportedLanguage>("indonesian"); // Default to Indonesian for children
  const [style, setStyle] = useState("photorealistic");
  const [showCLIPOptimization, setShowCLIPOptimization] = useState(false);
  const { user } = useAuth();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    
    // Enhanced content check with suggestions
    const contentCheck = filterContent(newPrompt, language);
    if (!contentCheck.isAppropriate) {
      // Show child-friendly suggestions
      const alternatives = getChildFriendlyAlternatives(language);
      const suggestionText = language === "indonesian" 
        ? `\n\nSaran tema gambar: ${alternatives.slice(0, 3).join(', ')}`
        : `\n\nImage theme suggestions: ${alternatives.slice(0, 3).join(', ')}`;
      
      toast.error(
        language === "indonesian" ? "Kata-kata Tidak Sesuai" : "Inappropriate Content",
        {
          description: contentCheck.reason + suggestionText,
          duration: 6000 // Longer duration for educational content
        }
      );
      return; // Don't update the prompt if content is inappropriate
    }
    
    setPrompt(newPrompt);
    
    // Show CLIP optimization info for Indonesian prompts
    if (language === "indonesian" && newPrompt.length > 10) {
      setShowCLIPOptimization(true);
    }
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
  };

  const handleStyleChange = (value: string) => {
    setStyle(value);
  };

  // Create a properly typed handler function for language changes
  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
    setShowCLIPOptimization(value === "indonesian" && prompt.length > 10);
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error(language === "indonesian" ? "Masukkan deskripsi gambar" : "Please enter an image description");
      return;
    }

    // Double-check content before generation
    const contentCheck = filterContent(prompt, language);
    if (!contentCheck.isAppropriate) {
      toast.error(
        language === "indonesian" ? "Kata-kata Tidak Sesuai" : "Inappropriate Content",
        {
          description: contentCheck.reason
        }
      );
      return;
    }

    // Validate prompt quality for CLIP if Indonesian
    if (language === "indonesian") {
      const clipValidation = CLIPEnhancedService.validatePromptForCLIP(prompt);
      if (!clipValidation.isOptimal && clipValidation.score < 50) {
        toast.warning(
          language === "indonesian" ? "Prompt dapat dioptimalkan" : "Prompt can be optimized",
          {
            description: language === "indonesian" 
              ? `Skor kualitas: ${clipValidation.score}/100. ${clipValidation.suggestions.slice(0, 2).join(', ')}`
              : `Quality score: ${clipValidation.score}/100. ${clipValidation.suggestions.slice(0, 2).join(', ')}`,
            duration: 4000
          }
        );
      }
    }

    try {
      // Check if user has enough credits
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user?.id)
        .single();

      if (profileError) {
        throw new Error("Could not check available credits");
      }

      if (!profile || profile.credits < 1) {
        toast.error(
          language === "indonesian" ? "Kredit tidak cukup" : "Not enough credits",
          {
            description: language === "indonesian"
              ? "Anda memerlukan 1 kredit untuk membuat gambar"
              : "You need 1 credit to generate an image"
          }
        );
        return;
      }

      setIsGenerating(true);
      
      const processingMessage = language === "indonesian" 
        ? "Memproses dengan teknologi CLIP dan NLP Indonesia..."
        : "Processing with CLIP and Indonesian NLP technology...";
      
      toast.info(processingMessage, { 
        description: language === "indonesian"
          ? "Mengoptimalkan akurasi bahasa Indonesia untuk hasil yang lebih sesuai"
          : "Optimizing Indonesian language accuracy for better results" 
        }
      );
      
      try {
        const imageUrl = await generateImage({ 
          prompt: prompt, 
          aspectRatio, 
          language,
          style
        });
        
        if (imageUrl) {
          onImageGenerated(imageUrl, prompt);
          toast.success(
            language === "indonesian" ? "Gambar berkualitas tinggi berhasil dibuat!" : "High-quality image created successfully!"
          );
        } else {
          toast.error(
            language === "indonesian" ? "Gagal membuat gambar" : "Failed to create image"
          );
        }
      } catch (error) {
        console.error("Error generating image:", error);
        
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
            language === "indonesian" ? "Kesalahan membuat gambar" : "Error creating image",
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

  const getPlaceholderText = () => {
    return language === "indonesian" 
      ? "Contoh: Seekor kucing putih lucu bermain di taman yang indah dengan bunga-bunga berwarna cerah, gaya kartun ramah anak" 
      : "Example: A cute white cat playing in a beautiful garden with colorful flowers, child-friendly cartoon style";
  };

  const getTitle = () => {
    return language === "indonesian" ? "Buat Gambar Ramah Anak dengan Teknologi CLIP" : "Create Child-Friendly Image with CLIP Technology";
  };

  const getDescription = () => {
    return language === "indonesian" 
      ? "Masukkan deskripsi yang sesuai untuk anak-anak. Teknologi CLIP dan NLP Indonesia akan mengoptimalkan akurasi gambar" 
      : "Enter a child-appropriate description. CLIP and Indonesian NLP technology will optimize image accuracy";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {getTitle()}
          {language === "indonesian" && <Zap className="h-4 w-4 text-orange-500" />}
        </CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="language-select">
                {language === "indonesian" ? "Bahasa" : "Language"}
              </Label>
            </div>
            <Select 
              value={language} 
              onValueChange={handleLanguageChange}
              disabled={isGenerating}
            >
              <SelectTrigger id="language-select" className="w-[180px]">
                <SelectValue placeholder={language === "indonesian" ? "Pilih bahasa" : "Select language"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indonesian">🇮🇩 Indonesian (Optimized)</SelectItem>
                <SelectItem value="english">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCLIPOptimization && language === "indonesian" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-700 text-sm font-medium mb-1">
                <Zap className="h-4 w-4" />
                Optimasi CLIP & NLP Indonesia Aktif
              </div>
              <p className="text-orange-600 text-xs">
                Prompt Anda akan diproses dengan teknologi CLIP dan NLP Indonesia untuk hasil yang lebih akurat dan sesuai budaya.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prompt">{language === "indonesian" ? "Deskripsi Gambar" : "Image Description"}</Label>
            <Textarea
              id="prompt"
              placeholder={getPlaceholderText()}
              value={prompt}
              onChange={handlePromptChange}
              className="min-h-32 resize-y"
              disabled={isGenerating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="aspectRatio">{language === "indonesian" ? "Rasio Aspek" : "Aspect Ratio"}</Label>
            <Select 
              value={aspectRatio} 
              onValueChange={handleAspectRatioChange}
              disabled={isGenerating}
            >
              <SelectTrigger id="aspectRatio">
                <SelectValue placeholder={language === "indonesian" ? "Pilih rasio aspek" : "Select aspect ratio"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">{language === "indonesian" ? "Kotak (1:1)" : "Square (1:1)"}</SelectItem>
                <SelectItem value="3:4">{language === "indonesian" ? "Potret (3:4)" : "Portrait (3:4)"}</SelectItem>
                <SelectItem value="4:3">{language === "indonesian" ? "Lanskap (4:3)" : "Landscape (4:3)"}</SelectItem>
                <SelectItem value="16:9">{language === "indonesian" ? "Lebar (16:9)" : "Wide (16:9)"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">{language === "indonesian" ? "Gaya Gambar" : "Image Style"}</Label>
            <Select 
              value={style} 
              onValueChange={handleStyleChange}
              disabled={isGenerating}
            >
              <SelectTrigger id="style">
                <SelectValue placeholder={language === "indonesian" ? "Pilih gaya" : "Select style"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photorealistic">{language === "indonesian" ? "Foto Realistis" : "Photorealistic"}</SelectItem>
                <SelectItem value="digital-art">{language === "indonesian" ? "Seni Digital" : "Digital Art"}</SelectItem>
                <SelectItem value="anime">{language === "indonesian" ? "Anime" : "Anime"}</SelectItem>
                <SelectItem value="watercolor">{language === "indonesian" ? "Cat Air" : "Watercolor"}</SelectItem>
                <SelectItem value="comic-book">{language === "indonesian" ? "Komik" : "Comic Book"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateImage} 
            className="w-full mt-4" 
            size="lg"
            disabled={!prompt.trim() || isGenerating}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating 
              ? (language === "indonesian" ? "Sedang Memproses..." : "Processing...") 
              : (language === "indonesian" ? "Buat Gambar dengan CLIP" : "Generate Image with CLIP")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
