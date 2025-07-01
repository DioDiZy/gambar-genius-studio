
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Book, Languages, Zap } from "lucide-react";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { StoryInputOptions } from "./StoryInputOptions";
import { StoryTextArea } from "./StoryTextArea";
import { StoryGenerationButton } from "./StoryGenerationButton";
import { CharacterDescription } from "@/types/story";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { filterContent, getChildFriendlyAlternatives } from "@/utils/contentFilter";
import { CLIPEnhancedService } from "@/services/CLIPEnhancedService";
import { IndonesianNLPService } from "@/services/IndonesianNLPService";

interface StoryGeneratorProps {
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

// Define this type to be more specific about supported languages
type SupportedLanguage = "english" | "indonesian";

export const StoryGenerator = ({ 
  onImagesGenerated, 
  isGenerating,
  setIsGenerating
}: StoryGeneratorProps) => {
  const [story, setStory] = useState("");
  const [paragraphSeparator, setParagraphSeparator] = useState("\n\n");
  const [style, setStyle] = useState("photorealistic");
  const [characterDescriptions, setCharacterDescriptions] = useState("");
  const [characters, setCharacters] = useState<CharacterDescription[]>([]);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [language, setLanguage] = useState<SupportedLanguage>("indonesian");
  const [clipAnalysis, setClipAnalysis] = useState<any>(null);
  
  const { handleGenerateImages, paragraphs } = useStoryGeneration({
    story,
    paragraphSeparator,
    style,
    characterDescriptions,
    characters,
    isGenerating,
    setIsGenerating,
    onImagesGenerated,
    language
  });

  // Update paragraph count whenever story or separator changes
  useEffect(() => {
    setParagraphCount(paragraphs.length);
    
    // Perform CLIP analysis for Indonesian content
    if (language === "indonesian" && story.trim()) {
      const sampleParagraph = paragraphs[0] || story.substring(0, 200);
      if (sampleParagraph) {
        const analysis = CLIPEnhancedService.enhancePromptWithCLIP(
          sampleParagraph,
          style,
          language
        );
        const validation = CLIPEnhancedService.validatePromptForCLIP(analysis.clipOptimizedPrompt);
        setClipAnalysis({ analysis, validation });
      }
    } else {
      setClipAnalysis(null);
    }
  }, [paragraphs, language, story, style]);

  const getLanguageLabel = () => {
    return language === "indonesian" ? "Bahasa Cerita" : "Story Language";
  };

  // Create a properly typed handler function for language changes
  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
    setClipAnalysis(null); // Reset analysis when language changes
  };

  // Enhanced content validation with better error messages for children
  const handleStoryChange = (value: string) => {
    // Check content before setting
    const contentCheck = filterContent(value, language);
    if (!contentCheck.isAppropriate) {
      // Show child-friendly suggestions
      const alternatives = getChildFriendlyAlternatives(language);
      const suggestionText = language === "indonesian" 
        ? `\n\nSaran tema cerita: ${alternatives.slice(0, 3).join(', ')}`
        : `\n\nStory theme suggestions: ${alternatives.slice(0, 3).join(', ')}`;
      
      toast.error(
        language === "indonesian" ? "Kata-kata Tidak Sesuai" : "Inappropriate Content",
        {
          description: contentCheck.reason + suggestionText,
          duration: 6000 // Longer duration for educational content
        }
      );
      return; // Don't update the story if content is inappropriate
    }
    setStory(value);
  };

  // Add validation for character descriptions with suggestions
  const handleCharacterDescriptionsChange = (value: string) => {
    const contentCheck = filterContent(value, language);
    if (!contentCheck.isAppropriate) {
      toast.error(
        language === "indonesian" ? "Deskripsi Karakter Tidak Sesuai" : "Inappropriate Character Description",
        {
          description: contentCheck.reason + (language === "indonesian" 
            ? "\n\nContoh yang baik: 'Seorang pria baik hati dengan senyuman ramah'" 
            : "\n\nGood example: 'A kind man with a friendly smile'"),
          duration: 5000
        }
      );
      return;
    }
    setCharacterDescriptions(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          {language === "indonesian" ? "Cerita ke Gambar" : "Story to Images"}
          {language === "indonesian" && (
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              CLIP Enhanced
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {language === "indonesian" 
            ? "Tulis cerita yang ramah anak dan hasilkan gambar storyboard yang konsisten dengan teknologi CLIP dan NLP Indonesia untuk hasil yang lebih akurat" 
            : "Write a child-friendly story and generate consistent storyboard images for each paragraph"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="language-select">{getLanguageLabel()}</Label>
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
                <SelectItem value="indonesian">Indonesian (Bahasa Indonesia)</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CLIP Analysis Display for Indonesian */}
          {language === "indonesian" && clipAnalysis && (
            <Alert className="bg-blue-50 border-blue-200">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Analisis CLIP untuk Bahasa Indonesia:</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Skor Kualitas: {clipAnalysis.validation.score}/100</p>
                      <p className="text-muted-foreground">
                        {clipAnalysis.validation.isOptimal ? "Optimal untuk gambar" : "Dapat ditingkatkan"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Kata Kunci Visual:</p>
                      <p className="text-muted-foreground">
                        {clipAnalysis.analysis.visualKeywords.slice(0, 3).join(", ") || "Tidak ada"}
                      </p>
                    </div>
                  </div>
                  {clipAnalysis.validation.suggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-sm">Saran untuk hasil lebih baik:</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {clipAnalysis.validation.suggestions.slice(0, 2).map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <StoryInputOptions
            paragraphSeparator={paragraphSeparator}
            onSeparatorChange={setParagraphSeparator}
            style={style}
            onStyleChange={setStyle}
            characterDescriptions={characterDescriptions}
            onCharacterDescriptionsChange={handleCharacterDescriptionsChange}
            isGenerating={isGenerating}
            characters={characters}
            onCharactersChange={setCharacters}
            language={language}
          />

          <Separator className="my-4" />

          <StoryTextArea
            story={story}
            onStoryChange={handleStoryChange}
            paragraphCount={paragraphCount}
            isGenerating={isGenerating}
            language={language}
          />

          <div className="flex items-center justify-end">
            <StoryGenerationButton
              onGenerate={handleGenerateImages}
              disabled={!story.trim()}
              isGenerating={isGenerating}
              language={language}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
