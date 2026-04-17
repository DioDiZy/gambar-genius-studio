import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CharacterDescription } from "@/types/story";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoryTemplateSelectorProps {
  characters: CharacterDescription[];
  onStoryGenerated: (story: string) => void;
  onCharactersGenerated?: (characters: CharacterDescription[]) => void;
  onAdditionalInstructionsGenerated?: (instructions: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const TEMPLATES = [
  { id: "petualangan-hutan", label: "Forest Adventure" },
  { id: "persahabatan", label: "Friendship" },
  { id: "hewan-ajaib", label: "Magical Animals" },
  { id: "petualangan-laut", label: "Ocean Quest" },
  { id: "petualangan-luar-angkasa", label: "Outer Space" },
  { id: "pahlawan-kecil", label: "Little Hero" },
  { id: "dunia-fantasi", label: "Fantasy World" },
  { id: "misteri-sekolah", label: "School Mystery" },
];

export const StoryTemplateSelector = ({
  characters,
  onStoryGenerated,
  onCharactersGenerated,
  onAdditionalInstructionsGenerated,
  isGenerating,
  disabled,
}: StoryTemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const handleGenerateFromTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsLoadingTemplate(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-story-template", {
        body: {
          template: templateId,
          characters: characters.map((c) => ({
            name: c.name,
            appearance: c.appearance,
          })),
        },
      });

      if (error) {
        const errorMsg =
          typeof error === "object" && error?.message
            ? error.message
            : "Couldn't generate a story from this theme";
        toast.error(errorMsg);
        return;
      }

      if (data?.story) {
        onStoryGenerated(data.story);

        if (
          data.characters &&
          Array.isArray(data.characters) &&
          data.characters.length > 0 &&
          onCharactersGenerated
        ) {
          const existingNames = new Set(characters.map((c) => c.name.toLowerCase()));
          const newChars: CharacterDescription[] = data.characters
            .filter((c: any) => c.name && !existingNames.has(c.name.toLowerCase()))
            .map((c: any) => ({
              name: c.name,
              appearance: c.appearance || "",
              referenceImages: [],
            }));
          if (newChars.length > 0) {
            onCharactersGenerated([...characters, ...newChars]);
          }
        }

        if (data.additionalInstructions && onAdditionalInstructionsGenerated) {
          onAdditionalInstructionsGenerated(data.additionalInstructions);
        }

        toast.success("Story added — feel free to edit it.");
      }
    } catch (err) {
      toast.error("Couldn't generate a story from this theme");
    } finally {
      setIsLoadingTemplate(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Need inspiration?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pick a theme and we'll start a story for you.
        </p>
      </div>

      {characters.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Your characters ({characters.map((c) => c.name).join(", ")}) will appear automatically.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((tmpl) => {
          const isLoading = isLoadingTemplate && selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => handleGenerateFromTemplate(tmpl.id)}
              disabled={disabled || isGenerating || isLoadingTemplate}
              className="
                inline-flex items-center gap-1.5
                text-sm px-3 py-1.5 rounded-full
                border border-border bg-background
                text-foreground/80
                transition-colors
                hover:border-primary/40 hover:text-foreground hover:bg-accent/30
                disabled:opacity-50 disabled:pointer-events-none
              "
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {tmpl.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
