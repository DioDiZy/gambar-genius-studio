
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Book, Languages } from "lucide-react";
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
import { filterContent, getChildFriendlyAlternatives } from "@/utils/contentFilter";

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
  const [language, setLanguage] = useState<SupportedLanguage>("indonesian"); // Default to Indonesian for children
  
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
  }, [paragraphs]);

  const getLanguageLabel = () => {
    return language === "indonesian" ? "Bahasa Cerita" : "Story Language";
  };

  // Create a properly typed handler function for language changes
  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
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
        </CardTitle>
        <CardDescription>
          {language === "indonesian" 
            ? "Tulis cerita yang ramah anak dan hasilkan gambar storyboard yang konsisten untuk setiap paragraf" 
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
