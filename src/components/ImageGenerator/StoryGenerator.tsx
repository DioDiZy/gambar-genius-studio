import { useState, useEffect } from "react";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { StoryInputOptions } from "./StoryInputOptions";
import { StoryTextArea } from "./StoryTextArea";
import { StoryGenerationButton } from "./StoryGenerationButton";
import { StoryTemplateSelector } from "./StoryTemplateSelector";
import { CharacterDescription } from "@/types/story";
import { validateIndonesianSentence } from "@/utils/indonesianLanguageValidation";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DetailedCharacter, generateCharacterPromptBlock } from "@/types/character";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface StoryGeneratorProps {
  onImagesGenerated: (urls: string[], prompts: string[]) => void;
  onStructuredDataGenerated?: (structuredData: any) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  storyTitle: string;
  onStoryTitleChange: (title: string) => void;
}

export const StoryGenerator = ({
  onImagesGenerated,
  onStructuredDataGenerated,
  isGenerating,
  setIsGenerating,
  storyTitle,
  onStoryTitleChange,
}: StoryGeneratorProps) => {
  const [story, setStory] = useState("");
  const [paragraphSeparator, setParagraphSeparator] = useState("\n\n");
  const [characterDescriptions, setCharacterDescriptions] = useState("");
  const [characters, setCharacters] = useState<CharacterDescription[]>([]);
  const [paragraphCount, setParagraphCount] = useState(0);

  // Read detailed characters from localStorage for prompt injection
  const [detailedCharacters] = useLocalStorageState<DetailedCharacter[]>('story_ai_characters', []);

  const style = "storyboard-sketch";

  // Merge detailed characters into legacy format for prompt generation
  const mergedCharacters: CharacterDescription[] = [
    ...characters,
    ...detailedCharacters.filter(dc => dc.name).map(dc => ({
      name: dc.name,
      appearance: generateCharacterPromptBlock(dc),
      referenceImages: dc.referenceImages,
    })),
  ];

  // Build extra character descriptions from detailed profiles
  const detailedCharDescriptions = detailedCharacters
    .filter(dc => dc.name)
    .map(dc => generateCharacterPromptBlock(dc))
    .join('. ');
  const mergedDescriptions = [characterDescriptions, detailedCharDescriptions].filter(Boolean).join('. ');

  const { handleGenerateImages, paragraphs } = useStoryGeneration({
    story,
    paragraphSeparator,
    style,
    characterDescriptions: mergedDescriptions,
    characters: mergedCharacters,
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
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Langkah 1</p>
        <h2 className="font-heading text-2xl md:text-3xl text-foreground">Tulis ceritamu</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">Setiap paragraf yang kamu tulis akan menjadi satu halaman di buku ceritamu.</p>
      </header>

      {/* Title input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Judul buku <span className="text-muted-foreground font-normal">(opsional)</span>
        </label>
        <Input
          placeholder="Contoh: Petualangan di Hutan Ajaib"
          value={storyTitle}
          onChange={(e) => onStoryTitleChange(e.target.value)}
          disabled={isGenerating}
          className="rounded-xl border-input focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 bg-card"
        />
      </div>

      {/* Story input — the centerpiece */}
      <StoryTextArea story={story} onStoryChange={setStory} paragraphCount={paragraphCount} isGenerating={isGenerating} language="indonesian" validation={indonesianValidation} />

      {/* Injected characters indicator */}
      {detailedCharacters.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/60 rounded-lg p-3 border border-border/40">
          <Users size={14} className="text-orange-500" />
          <span>{detailedCharacters.length} karakter dari profil akan otomatis disertakan dalam prompt.</span>
          <div className="flex gap-1 flex-wrap">
            {detailedCharacters.filter(c => c.name).map(c => (
              <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Templates — quiet, secondary */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-5">
        <StoryTemplateSelector characters={characters} onStoryGenerated={handleTemplateStoryGenerated} onCharactersGenerated={setCharacters} onAdditionalInstructionsGenerated={setCharacterDescriptions} isGenerating={isGenerating} />
      </div>

      {/* Advanced options */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="options" className="border border-border/60 rounded-xl px-4 bg-card/40">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">Karakter & pengaturan lanjutan</AccordionTrigger>
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
        <StoryGenerationButton onGenerate={handleGenerateImages} disabled={!story.trim()} isGenerating={isGenerating} language="indonesian" />
      </div>
    </section>
  );
};
