import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { CharacterDescription } from "@/types/story";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoryTemplateSelectorProps {
  characters: CharacterDescription[];
  onStoryGenerated: (story: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const TEMPLATES = [
  { id: "petualangan-hutan", label: "🌳 Petualangan Hutan", desc: "Jelajahi hutan ajaib penuh misteri" },
  { id: "persahabatan", label: "🤝 Persahabatan", desc: "Kisah indah tentang sahabat sejati" },
  { id: "hewan-ajaib", label: "🦄 Hewan Ajaib", desc: "Bertemu hewan-hewan dengan kekuatan spesial" },
  { id: "petualangan-laut", label: "🌊 Petualangan Laut", desc: "Menyelam ke dunia bawah laut yang menakjubkan" },
  { id: "petualangan-luar-angkasa", label: "🚀 Luar Angkasa", desc: "Terbang ke planet-planet baru" },
  { id: "pahlawan-kecil", label: "🦸 Pahlawan Kecil", desc: "Anak biasa dengan keberanian luar biasa" },
  { id: "dunia-fantasi", label: "🏰 Dunia Fantasi", desc: "Kastil, peri, dan makhluk mitos" },
  { id: "misteri-sekolah", label: "🔍 Misteri Sekolah", desc: "Pecahkan misteri seru di sekolah" },
];

export const StoryTemplateSelector = ({
  characters,
  onStoryGenerated,
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
        toast.error("Gagal membuat cerita dari template");
        return;
      }

      if (data?.story) {
        onStoryGenerated(data.story);
        const hasChars = characters.length > 0;
        toast.success("Cerita berhasil dibuat dari template!", {
          description: hasChars
            ? `Cerita telah menyertakan ${characters.length} karakter yang kamu buat`
            : "Kamu bisa mengedit ceritanya sesuai keinginanmu",
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
        <Wand2 className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Template Cerita</Label>
      </div>

      {characters.length > 0 && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          ✨ Karakter yang sudah kamu buat ({characters.map(c => c.name).join(", ")}) akan otomatis dimasukkan ke dalam cerita template.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((tmpl) => {
          const isLoading = isLoadingTemplate && selectedTemplate === tmpl.id;
          return (
            <Button
              key={tmpl.id}
              variant="outline"
              size="sm"
              className="h-auto py-2 px-3 flex flex-col items-start text-left gap-0.5 hover:bg-accent/50 transition-colors"
              onClick={() => handleGenerateFromTemplate(tmpl.id)}
              disabled={disabled || isGenerating || isLoadingTemplate}
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Membuat cerita...
                </span>
              ) : (
                <>
                  <span className="text-xs font-medium">{tmpl.label}</span>
                  <span className="text-[10px] text-muted-foreground font-normal leading-tight">{tmpl.desc}</span>
                </>
              )}
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Pilih template untuk membuat cerita otomatis. Kamu bisa mengedit ceritanya setelah dibuat.
      </p>
    </div>
  );
};
