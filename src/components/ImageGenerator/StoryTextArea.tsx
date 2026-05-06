import { Textarea } from "@/components/ui/textarea";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
  language?: string;
}

export const StoryTextArea = ({ story, onStoryChange, paragraphCount, isGenerating }: StoryTextAreaProps) => {
  const placeholder =
    "Pada suatu hari di sebuah desa kecil, hiduplah seorang anak yang sangat suka bertualang...\n\nSuatu pagi, ia berjalan masuk ke dalam hutan dan menemukan pondok tua yang sudah lama ditinggalkan. Sinar matahari menembus celah-celah atap jerami.";

  const showValidationWarning = story.trim().length > 0 && validation && !validation.isLikelyIndonesianSentence;

  const charCount = story.length;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">Ceritamu</label>
        <span className="text-xs text-muted-foreground tabular-nums">{paragraphCount > 0 ? `${paragraphCount} ${paragraphCount === 1 ? "halaman" : "halaman"} · ${charCount} karakter` : `${charCount} karakter`}</span>
      </div>

      <Textarea
        placeholder={placeholder}
        value={story}
        onChange={(e) => onStoryChange(e.target.value)}
        className="min-h-[320px] text-[15px] leading-[1.7] font-heading rounded-xl border border-input focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 bg-card p-5 resize-y placeholder:text-muted-foreground/50"
        disabled={isGenerating}
      />

      <p className="text-xs text-muted-foreground leading-relaxed">Tips: pisahkan setiap paragraf dengan baris kosong. Setiap paragraf akan menjadi satu halaman bergambar.</p>
    </div>
  );
};
