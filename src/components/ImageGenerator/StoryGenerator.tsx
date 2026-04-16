
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { PenLine, Palette, Users } from "lucide-react";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { StoryInputOptions } from "./StoryInputOptions";
import { StoryTextArea } from "./StoryTextArea";
import { StoryGenerationButton } from "./StoryGenerationButton";
import { StoryTemplateSelector } from "./StoryTemplateSelector";
import { CharacterDescription } from "@/types/story";
import { validateIndonesianSentence } from "@/utils/indonesianLanguageValidation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <div className="fun-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-fun-purple-light to-fun-teal-light px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-primary/10 p-2 rounded-xl">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-kid-xl font-bold text-foreground">Tulis Ceritamu ✍️</h2>
        </div>
        <p className="text-kid-sm text-muted-foreground ml-12">
          Tulis cerita seru, lalu kami buatkan gambar storyboard-nya!
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* Template selector - prominent */}
        <div className="bg-fun-yellow-light/50 rounded-2xl p-4 border border-fun-yellow/20">
          <StoryTemplateSelector
            characters={characters}
            onStoryGenerated={handleTemplateStoryGenerated}
            onCharactersGenerated={setCharacters}
            onAdditionalInstructionsGenerated={setCharacterDescriptions}
            isGenerating={isGenerating}
          />
        </div>

        <Separator className="my-1" />

        {/* Story text area - the main focus */}
        <StoryTextArea
          story={story}
          onStoryChange={setStory}
          paragraphCount={paragraphCount}
          isGenerating={isGenerating}
          language="indonesian"
          validation={indonesianValidation}
        />

        {/* Advanced options in accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="options" className="border rounded-2xl px-4">
            <AccordionTrigger className="text-kid-sm font-medium hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Karakter & Pengaturan Lanjutan</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Generate button - big and exciting */}
        <div className="flex items-center justify-center pt-2">
          <StoryGenerationButton
            onGenerate={handleGenerateImages}
            disabled={!story.trim()}
            isGenerating={isGenerating}
            language="indonesian"
          />
        </div>
      </div>
    </div>
  );
};
