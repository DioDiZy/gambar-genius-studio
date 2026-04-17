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
  { id: "petualangan-hutan", label: "Petualangan Hutan" },
  { id: "persahabatan", label: "Persahabatan" },
  { id: "hewan-ajaib", label: "Hewan Ajaib" },
  { id: "petualangan-laut", label: "Petualangan Laut" },
  { id: "petualangan-luar-angkasa", label: "Luar Angkasa" },
  { id: "pahlawan-kecil", label: "Pahlawan Kecil" },
  { id: "dunia-fantasi", label: "Dunia Fantasi" },
  { id: "misteri-sekolah", label: "Misteri Sekolah" },
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
            : "Gagal membuat cerita dari tema ini";
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

        toast.success("Cerita berhasil dibuat — kamu bisa mengeditnya.");
      }
    } catch (err) {
      toast.error("Gagal membuat cerita dari tema ini");
    } finally {
      setIsLoadingTemplate(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Butuh inspirasi?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pilih tema dan kami akan memulaikan cerita untukmu.
        </p>
      </div>

      {characters.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Karaktermu ({characters.map((c) => c.name).join(", ")}) akan otomatis muncul di cerita.
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
