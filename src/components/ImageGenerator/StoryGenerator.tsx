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
import { XCircle, Check } from "lucide-react";

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

      <StoryTextArea story={story} onStoryChange={setStory} paragraphCount={paragraphCount} isGenerating={isGenerating} language="indonesian" badwordPositions={validation.details.badwords.positions} />

      {/* === Validation Feedback with Rule Checklist === */}
      {story.trim().length > 0 && (() => {
        const d = validation.details;
        const rules: Array<{ label: string; passed: boolean; active: boolean }> = [
          { label: "Tidak kosong", passed: !d.empty, active: true },
          { label: `Panjang cukup (≥10 kata)`, passed: !d.tooShort, active: !d.empty },
          { label: "Bahasa Indonesia", passed: d.indonesian.isLikelyIndonesianSentence, active: !d.empty && !d.tooShort },
          { label: "Tanpa kata tidak pantas", passed: !d.badwords.hasBadwords, active: !d.empty },
          { label: "Konteks cerita jelas", passed: d.context.isContextClear, active: !d.empty && !d.tooShort },
        ];

        const borderColor =
          validation.status === "valid"
            ? "border-green-300/60 bg-green-50/60"
            : validation.status === "warning"
              ? "border-orange-300/60 bg-orange-50/60"
              : "border-destructive/40 bg-destructive/5";

        return (
          <div className={`rounded-xl border px-4 py-3 text-sm space-y-3 ${borderColor}`}>
            {/* Main message */}
            <div className="flex items-start gap-2">
              {validation.status === "valid" ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
              ) : validation.status === "warning" ? (
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-orange-600" />
              ) : validation.details.badwords.hasBadwords ? (
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              ) : (
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              )}
              <p className={`font-medium ${validation.status === "valid" ? "text-green-700" : validation.status === "warning" ? "text-orange-700" : "text-destructive"}`}>
                {validation.message}
              </p>
              {validation.status === "valid" && validation.details.context.tokoh.length > 0 && (
                <span className="ml-auto text-xs text-green-600/70">
                  Tokoh: {validation.details.context.tokoh.slice(0, 3).join(", ")}
                  {validation.details.context.tokoh.length > 3 ? "..." : ""}
                </span>
              )}
            </div>

            {/* Suggestions */}
            {validation.suggestions.length > 0 && (
              <ul className="ml-6 list-disc text-xs space-y-0.5 opacity-80">
                {validation.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}

            {/* Rule checklist */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-border/40">
              {rules.map((rule) => (
                <span key={rule.label} className={`inline-flex items-center gap-1 text-xs ${!rule.active ? "text-muted-foreground/50" : rule.passed ? "text-green-600" : "text-destructive"}`}>
                  {!rule.active ? (
                    <span className="h-3 w-3 rounded-full border border-muted-foreground/30 inline-block" />
                  ) : rule.passed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {rule.label}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

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
