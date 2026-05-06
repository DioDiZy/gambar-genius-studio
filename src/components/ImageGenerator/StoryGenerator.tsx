import { useState, useEffect, useMemo } from "react";
import { useStoryGeneration } from "@/hooks/useStoryGeneration";
import { StoryInputOptions } from "./StoryInputOptions";
import { StoryTextArea } from "./StoryTextArea";
import { StoryGenerationButton } from "./StoryGenerationButton";
import { StoryTemplateSelector } from "./StoryTemplateSelector";
import { CharacterDescription } from "@/types/story";
import { validateStoryInput, type StoryValidationResult } from "@/utils/storyValidationPipeline";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";

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
  const [characters, setCharacters] = useLocalStorageState<CharacterDescription[]>('story_ai_characters', []);
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

  const validation: StoryValidationResult = useMemo(() => validateStoryInput(story), [story]);

  const handleTemplateStoryGenerated = (generatedStory: string) => {
    setStory(generatedStory);
  };

  return (
    <section className="space-y-6">
      {/* === TULIS CERITA === */}
      <header className="pb-4 border-b border-border/60">
        <h2 className="font-heading text-2xl md:text-3xl text-foreground">Tulis Ceritamu</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">Setiap paragraf yang kamu tulis akan menjadi satu halaman di buku ceritamu.</p>
      </header>

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

      <StoryTextArea story={story} onStoryChange={setStory} paragraphCount={paragraphCount} isGenerating={isGenerating} language="indonesian" />

      {/* === Validation Feedback === */}
      {story.trim().length > 0 && validation.status !== "valid" && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm space-y-1 ${
            validation.status === "invalid"
              ? "border-destructive/40 bg-destructive/5 text-destructive"
              : "border-orange-300/60 bg-orange-50/60 text-orange-700"
          }`}
        >
          <div className="flex items-start gap-2">
            {validation.status === "invalid" ? (
              validation.details.badwords.hasBadwords ? (
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              )
            ) : (
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <p className="font-medium">{validation.message}</p>
          </div>
          {validation.suggestions.length > 0 && (
            <ul className="ml-6 list-disc text-xs space-y-0.5 opacity-80">
              {validation.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {story.trim().length > 0 && validation.status === "valid" && (
        <div className="rounded-xl border border-green-300/60 bg-green-50/60 text-green-700 px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>{validation.message}</p>
          {validation.details.context.tokoh.length > 0 && (
            <span className="ml-auto text-xs opacity-70">
              Tokoh: {validation.details.context.tokoh.slice(0, 3).join(", ")}
              {validation.details.context.tokoh.length > 3 ? "..." : ""}
            </span>
          )}
        </div>
      )}

      {/* Templates */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-5">
        <StoryTemplateSelector characters={characters} onStoryGenerated={handleTemplateStoryGenerated} onCharactersGenerated={setCharacters} onAdditionalInstructionsGenerated={setCharacterDescriptions} isGenerating={isGenerating} />
      </div>

      {/* === Pengaturan Lanjutan (semua fitur dalam satu accordion) === */}
      <Accordion type="multiple" className="w-full space-y-2">
        <AccordionItem value="options" className="border border-border/60 rounded-xl px-4 bg-card/40">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">Pengaturan lanjutan</AccordionTrigger>
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

      {/* Generate - no longer requires characters */}
      <div className="pt-2">
        <StoryGenerationButton onGenerate={handleGenerateImages} disabled={!story.trim() || !validation.canProceed} isGenerating={isGenerating} language="indonesian" />
      </div>
    </section>
  );
};
