import { useState, useEffect } from "react";
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
  setIsGenerating,
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
    language: "indonesian",
  });

  useEffect(() => {
    setParagraphCount(paragraphs.length);
  }, [paragraphs]);

  const indonesianValidation = validateIndonesianSentence(story);

  const handleTemplateStoryGenerated = (generatedStory: string) => {
    setStory(generatedStory);
  };

  return (
    <section className="space-y-6">
      {/* Section header */}
      <header className="pb-4 border-b border-border/60">
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
          Step 1
        </p>
        <h2 className="font-heading text-2xl md:text-3xl text-foreground">
          Write your story
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
          Each paragraph you write becomes one page of your storybook.
        </p>
      </header>

      {/* Story input — the centerpiece */}
      <StoryTextArea
        story={story}
        onStoryChange={setStory}
        paragraphCount={paragraphCount}
        isGenerating={isGenerating}
        language="indonesian"
        validation={indonesianValidation}
      />

      {/* Templates — quiet, secondary */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-5">
        <StoryTemplateSelector
          characters={characters}
          onStoryGenerated={handleTemplateStoryGenerated}
          onCharactersGenerated={setCharacters}
          onAdditionalInstructionsGenerated={setCharacterDescriptions}
          isGenerating={isGenerating}
        />
      </div>

      {/* Advanced options */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="options" className="border border-border/60 rounded-xl px-4 bg-card/40">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
            Characters & advanced settings
          </AccordionTrigger>
          <AccordionContent className="pt-2">
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

      {/* Generate */}
      <div className="pt-2">
        <StoryGenerationButton
          onGenerate={handleGenerateImages}
          disabled={!story.trim()}
          isGenerating={isGenerating}
          language="indonesian"
        />
      </div>
    </section>
  );
};
