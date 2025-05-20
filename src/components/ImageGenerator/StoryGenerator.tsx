
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
  const [characters, setCharacters] = useState<CharacterDescription[]>([]);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [language, setLanguage] = useState("english");
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          {language === "indonesian" ? "Cerita ke Gambar" : "Story to Images"}
        </CardTitle>
        <CardDescription>
          {language === "indonesian" 
            ? "Tulis cerita dan hasilkan gambar storyboard yang konsisten untuk setiap paragraf" 
            : "Write a story and generate consistent storyboard images for each paragraph"}
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
              onValueChange={setLanguage}
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

          <StoryInputOptions
            paragraphSeparator={paragraphSeparator}
            onSeparatorChange={setParagraphSeparator}
            style={style}
            onStyleChange={setStyle}
            characterDescriptions={characterDescriptions}
            onCharacterDescriptionsChange={setCharacterDescriptions}
            isGenerating={isGenerating}
            characters={characters}
            onCharactersChange={setCharacters}
            language={language}
          />

          <Separator className="my-4" />

          <StoryTextArea
            story={story}
            onStoryChange={setStory}
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
