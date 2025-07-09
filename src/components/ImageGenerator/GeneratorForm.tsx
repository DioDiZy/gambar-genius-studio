
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateImage } from "@/services/ImageService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [language, setLanguage] = useState<SupportedLanguage>("english");
  const { user } = useAuth();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
  };

  // Create a properly typed handler function for language changes
  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error(language === "indonesian" ? "Masukkan prompt" : "Please enter a prompt");
      return;
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
      
      toast.info(
        language === "indonesian" ? "Membuat gambar..." : "Creating image...",
        { 
          description: language === "indonesian"
            ? "Ini mungkin memerlukan beberapa saat"
            : "This may take a few moments" 
        }
      );
      
      try {
        // Pass language to the image generation service
        const imageUrl = await generateImage({ prompt, aspectRatio, language });
        
        if (imageUrl) {
          onImageGenerated(imageUrl, prompt);
          toast.success(
            language === "indonesian" ? "Gambar berhasil dibuat!" : "Image created successfully!"
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
      ? "Misalnya: Kucing putih berbulu lebat duduk di taman yang indah, dengan bunga-bunga berwarna cerah di sekitarnya, gaya fotografi profesional" 
      : "Example: A fluffy white cat sitting in a beautiful garden, with colorful flowers around, professional photography style";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === "indonesian" ? "Buat Gambar AI" : "Create AI Image"}</CardTitle>
        <CardDescription>
          {language === "indonesian" 
            ? "Masukkan prompt terperinci untuk membuat gambar AI sesuai dengan keinginan Anda" 
            : "Enter a detailed prompt to create an AI image to your specifications"}
        </CardDescription>
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
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="indonesian">Indonesian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">{language === "indonesian" ? "Prompt Anda" : "Your Prompt"}</Label>
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
          
          <Button 
            onClick={handleGenerateImage} 
            className="w-full mt-4" 
            size="lg"
            disabled={!prompt.trim() || isGenerating}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating 
              ? (language === "indonesian" ? "Sedang Membuat..." : "Generating...") 
              : (language === "indonesian" ? "Buat Gambar" : "Generate Image")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
