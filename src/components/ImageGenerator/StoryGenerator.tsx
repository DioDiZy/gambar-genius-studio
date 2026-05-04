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
import { DetailedCharacter, StoryScene, generateCharacterPromptBlock } from "@/types/character";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, GitBranch, ShieldCheck } from "lucide-react";
import { CharacterManager } from "@/components/CharacterManager/CharacterManager";
import { StoryFlowManager } from "@/components/StoryFlowManager/StoryFlowManager";
import { ConsistencyChecker } from "@/components/ConsistencyChecker/ConsistencyChecker";

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

  // localStorage-backed Character & Flow
  const [detailedCharacters, setDetailedCharacters] = useLocalStorageState<DetailedCharacter[]>('story_ai_characters', []);
  const [storyScenes, setStoryScenes] = useLocalStorageState<StoryScene[]>('story_ai_flow', []);

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

  const detailedCharDescriptions = detailedCharacters
    .filter(dc => dc.name)
    .map(dc => generateCharacterPromptBlock(dc))
    .join('. ');
  const mergedDescriptions = [characterDescriptions, detailedCharDescriptions].filter(Boolean).join('. ');

  const hasValidCharacters = detailedCharacters.some(c => c.name.trim());
  const canGenerate = story.trim() && hasValidCharacters;

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
      {/* === LANGKAH 1: KARAKTER (WAJIB) === */}
      <header className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground">Langkah 1</p>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Wajib</Badge>
        </div>
        <h2 className="font-heading text-2xl md:text-3xl text-foreground">Buat Karakter</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">Tambahkan minimal satu karakter agar gambar ceritamu konsisten.</p>
      </header>

      <CharacterManager characters={detailedCharacters} onChange={setDetailedCharacters} />

      {!hasValidCharacters && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl p-3 border border-destructive/20">
          <AlertTriangle size={16} />
          <span>Tambahkan minimal satu karakter dengan nama untuk bisa membuat gambar.</span>
        </div>
      )}

      {/* === LANGKAH 2: TULIS CERITA === */}
      <header className="pb-4 border-b border-border/60 pt-4">
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Langkah 2</p>
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

      <StoryTextArea story={story} onStoryChange={setStory} paragraphCount={paragraphCount} isGenerating={isGenerating} language="indonesian" validation={indonesianValidation} />

      {hasValidCharacters && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/60 rounded-lg p-3 border border-border/40">
          <Users size={14} className="text-orange-500" />
          <span>{detailedCharacters.filter(c => c.name).length} karakter akan otomatis disertakan dalam prompt.</span>
          <div className="flex gap-1 flex-wrap">
            {detailedCharacters.filter(c => c.name).map(c => (
              <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-5">
        <StoryTemplateSelector characters={characters} onStoryGenerated={handleTemplateStoryGenerated} onCharactersGenerated={setCharacters} onAdditionalInstructionsGenerated={setCharacterDescriptions} isGenerating={isGenerating} />
      </div>

      {/* === Alur, Konsistensi, Pengaturan (accordion) === */}
      <Accordion type="multiple" className="w-full space-y-2">
        <AccordionItem value="flow" className="border border-border/60 rounded-xl px-4 bg-card/40">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
            <span className="flex items-center gap-2"><GitBranch size={14} /> Alur Cerita <Badge variant="secondary" className="text-xs">{storyScenes.length} scene</Badge></span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <StoryFlowManager scenes={storyScenes} characters={detailedCharacters} onChange={setStoryScenes} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="consistency" className="border border-border/60 rounded-xl px-4 bg-card/40">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
            <span className="flex items-center gap-2"><ShieldCheck size={14} /> Konsistensi & Backup</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <ConsistencyChecker
              characters={detailedCharacters}
              scenes={storyScenes}
              onImport={(chars, scenes) => { setDetailedCharacters(chars); setStoryScenes(scenes); }}
              onReset={() => { setDetailedCharacters([]); setStoryScenes([]); }}
            />
          </AccordionContent>
        </AccordionItem>

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

      {/* Generate */}
      <div className="pt-2">
        <StoryGenerationButton onGenerate={handleGenerateImages} disabled={!canGenerate} isGenerating={isGenerating} language="indonesian" />
        {!hasValidCharacters && story.trim() && (
          <p className="text-xs text-destructive mt-2 text-center">⚠ Tambahkan minimal satu karakter di Langkah 1 untuk mulai membuat gambar.</p>
        )}
      </div>
    </section>
  );
};
