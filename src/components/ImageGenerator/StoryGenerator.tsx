
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Book } from "lucide-react";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { StoryInputOptions } from "./StoryInputOptions";
import { StoryTextArea } from "./StoryTextArea";
import { StoryGenerationButton } from "./StoryGenerationButton";
import { StoryTemplateSelector } from "./StoryTemplateSelector";
import { CharacterDescription } from "@/types/story";
import { validateIndonesianSentence } from "@/utils/indonesianLanguageValidation";

interface StoryGeneratorProps {
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  onStructuredDataGenerated?: (structuredData: any) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const StoryGenerator = ({ 
  onImagesGenerated, 
  onStructuredDataGenerated,
  isGenerating,
  setIsGenerating
}: StoryGeneratorProps) => {
  const [story, setStory] = useState("");
  const [paragraphSeparator, setParagraphSeparator] = useState("\n\n");
  const [characterDescriptions, setCharacterDescriptions] = useState("");
  const [characters, setCharacters] = useState<CharacterDescription[]>([]);
  const [paragraphCount, setParagraphCount] = useState(0);
  
  // Hardcode style to storyboard-sketch
  const style = "storyboard-sketch";

  const { handleGenerateImages, paragraphs } = useStoryGeneration({
    story,
    paragraphSeparator,
    style,
    characterDescriptions,
    characters,
    isGenerating,
    setIsGenerating,
    onImagesGenerated,
    onStructuredDataGenerated,
    language: "indonesian"
  });

  useEffect(() => {
    setParagraphCount(paragraphs.length);
  }, [paragraphs]);

  const indonesianValidation = validateIndonesianSentence(story);

  const handleTemplateStoryGenerated = (generatedStory: string) => {
    setStory(generatedStory);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Cerita ke Gambar
        </CardTitle>
        <CardDescription>
          Tulis cerita dan hasilkan gambar storyboard yang konsisten untuk setiap paragraf
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StoryInputOptions
            paragraphSeparator={paragraphSeparator}
            onSeparatorChange={setParagraphSeparator}
            style={style}
            onStyleChange={() => {}}
            characterDescriptions={characterDescriptions}
            onCharacterDescriptionsChange={setCharacterDescriptions}
            isGenerating={isGenerating}
            characters={characters}
            onCharactersChange={setCharacters}
            language="indonesian"
          />

          <Separator className="my-4" />

          <StoryTemplateSelector
            characters={characters}
            onStoryGenerated={handleTemplateStoryGenerated}
            isGenerating={isGenerating}
          />

          <Separator className="my-2" />

          <StoryTextArea
            story={story}
            onStoryChange={setStory}
            paragraphCount={paragraphCount}
            isGenerating={isGenerating}
            language="indonesian"
            validation={indonesianValidation}
          />

          <div className="flex items-center justify-end">
            <StoryGenerationButton
              onGenerate={handleGenerateImages}
              disabled={!story.trim()}
              isGenerating={isGenerating}
              language="indonesian"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
