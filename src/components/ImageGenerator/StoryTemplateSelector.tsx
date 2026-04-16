import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
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
  { id: "petualangan-hutan", label: "🌳 Petualangan Hutan", desc: "Jelajahi hutan ajaib penuh misteri", color: "bg-fun-green/10 border-fun-green/30 hover:bg-fun-green/20" },
  { id: "persahabatan", label: "🤝 Persahabatan", desc: "Kisah indah tentang sahabat sejati", color: "bg-fun-purple-light border-primary/20 hover:bg-fun-purple-light/80" },
  { id: "hewan-ajaib", label: "🦄 Hewan Ajaib", desc: "Bertemu hewan-hewan dengan kekuatan spesial", color: "bg-fun-coral-light border-fun-coral/20 hover:bg-fun-coral-light/80" },
  { id: "petualangan-laut", label: "🌊 Petualangan Laut", desc: "Menyelam ke dunia bawah laut yang menakjubkan", color: "bg-fun-blue-light border-fun-blue/20 hover:bg-fun-blue-light/80" },
  { id: "petualangan-luar-angkasa", label: "🚀 Luar Angkasa", desc: "Terbang ke planet-planet baru", color: "bg-fun-teal-light border-fun-teal/20 hover:bg-fun-teal-light/80" },
  { id: "pahlawan-kecil", label: "🦸 Pahlawan Kecil", desc: "Anak biasa dengan keberanian luar biasa", color: "bg-fun-yellow-light border-fun-yellow/20 hover:bg-fun-yellow-light/80" },
  { id: "dunia-fantasi", label: "🏰 Dunia Fantasi", desc: "Kastil, peri, dan makhluk mitos", color: "bg-fun-purple-light border-primary/20 hover:bg-fun-purple-light/80" },
  { id: "misteri-sekolah", label: "🔍 Misteri Sekolah", desc: "Pecahkan misteri seru di sekolah", color: "bg-fun-blue-light border-fun-blue/20 hover:bg-fun-blue-light/80" },
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
          characters: characters.map(c => ({
            name: c.name,
            appearance: c.appearance,
          })),
        },
      });

      if (error) {
        console.error("Template generation error:", error);
        const errorMsg = typeof error === 'object' && error?.message ? error.message : "Gagal membuat cerita dari template";
        toast.error(errorMsg);
        return;
      }

      if (data?.story) {
        onStoryGenerated(data.story);
        
        if (data.characters && Array.isArray(data.characters) && data.characters.length > 0 && onCharactersGenerated) {
          const existingNames = new Set(characters.map(c => c.name.toLowerCase()));
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
        
        const charCount = data.characters?.length || 0;
        toast.success("Cerita berhasil dibuat! 🎉", {
          description: `${charCount} karakter dan instruksi visual otomatis ditambahkan. Kamu bisa mengeditnya!`,
        });
      }
    } catch (err) {
      console.error("Template error:", err);
      toast.error("Gagal membuat cerita dari template");
    } finally {
      setIsLoadingTemplate(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-fun-yellow" />
        <Label className="text-kid-sm font-semibold">Belum punya ide? Pilih tema cerita! ✨</Label>
      </div>

      {characters.length > 0 && (
        <p className="text-kid-xs text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
          ✨ Karakter yang sudah kamu buat ({characters.map(c => c.name).join(", ")}) akan otomatis muncul di cerita!
        </p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {TEMPLATES.map((tmpl) => {
          const isLoading = isLoadingTemplate && selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              className={`
                text-left p-3 rounded-xl border-2 transition-all duration-200
                disabled:opacity-50 disabled:pointer-events-none
                ${tmpl.color}
                ${isLoading ? 'animate-pulse' : 'hover:scale-[1.02] active:scale-[0.98]'}
              `}
              onClick={() => handleGenerateFromTemplate(tmpl.id)}
              disabled={disabled || isGenerating || isLoadingTemplate}
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-kid-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Membuat cerita...
                </span>
              ) : (
                <>
                  <span className="text-kid-sm font-semibold block">{tmpl.label}</span>
                  <span className="text-kid-xs text-muted-foreground leading-tight block mt-0.5">{tmpl.desc}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-kid-xs text-muted-foreground text-center">
        Klik tema di atas, lalu cerita otomatis terisi. Kamu bisa mengeditnya sesuka hati! 😊
      </p>
    </div>
  );
};
