import { Textarea } from "@/components/ui/textarea";
import { IndonesianValidationResult } from "@/utils/indonesianLanguageValidation";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
  language?: string;
  validation?: IndonesianValidationResult;
}

export const StoryTextArea = ({
  story,
  onStoryChange,
  paragraphCount,
  isGenerating,
  language = "english",
  validation,
}: StoryTextAreaProps) => {
  const placeholder =
    language === "indonesian"
      ? "Pada suatu hari di negeri yang jauh...\n\nSaat sang pahlawan melanjutkan perjalanannya ke dalam hutan, dia menemukan sebuah pondok tua. Sinar bulan menyinari atap jerami yang sudah lapuk."
      : "Once upon a time in a distant land...\n\nAs the hero ventured deeper into the forest, they discovered an old mysterious cottage. Moonlight illuminated its thatched roof.";

  const showValidationWarning =
    language === "indonesian" &&
    story.trim().length > 0 &&
    validation &&
    !validation.isLikelyIndonesianSentence;

  const charCount = story.length;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">
          Your story
        </label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {paragraphCount > 0
            ? `${paragraphCount} ${paragraphCount === 1 ? "page" : "pages"} · ${charCount} chars`
            : `${charCount} chars`}
        </span>
      </div>

      <Textarea
        placeholder={placeholder}
        value={story}
        onChange={(e) => onStoryChange(e.target.value)}
        className="min-h-[320px] text-[15px] leading-[1.7] font-heading rounded-xl border border-input focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 bg-card p-5 resize-y placeholder:text-muted-foreground/50"
        disabled={isGenerating}
      />

      <p className="text-xs text-muted-foreground leading-relaxed">
        Tip: separate paragraphs with a blank line. Each paragraph becomes one page in your book.
      </p>

      {showValidationWarning && (
        <p className="text-xs text-foreground bg-muted/60 border border-border/60 rounded-lg px-3 py-2">
          The text doesn't look like natural Indonesian.
          {validation.reasons[0] ? ` ${validation.reasons[0]}.` : ""}
        </p>
      )}
    </div>
  );
};
