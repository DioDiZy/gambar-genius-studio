
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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { language: appLanguage, t } = useLanguage();
  const [story, setStory] = useState("");
  const [paragraphSeparator, setParagraphSeparator] = useState("\n\n");
  const [style, setStyle] = useState("photorealistic");
  const [characterDescriptions, setCharacterDescriptions] = useState("");
  const [characters, setCharacters] = useState<CharacterDescription[]>([]);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [language, setLanguage] = useState(appLanguage);
  
  // Update story language when app language changes
  useEffect(() => {
    setLanguage(appLanguage);
  }, [appLanguage]);
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          {t("story.title")}
        </CardTitle>
        <CardDescription>
          {t("story.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="language-select">{t("story.language")}</Label>
            </div>
            <Select 
              value={language} 
              onValueChange={setLanguage}
              disabled={isGenerating}
            >
              <SelectTrigger id="language-select" className="w-[180px]">
                <SelectValue placeholder={t("app.language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">{t("app.english")}</SelectItem>
                <SelectItem value="indonesian">{t("app.indonesian")}</SelectItem>
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
              onGenerate={handleGenerateImages}
              disabled={!story.trim()}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
