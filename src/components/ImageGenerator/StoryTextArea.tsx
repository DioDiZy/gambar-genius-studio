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
  const getPlaceholderByLanguage = () => {
    switch (language) {
      case "indonesian":
        return "Pada suatu hari di negeri yang jauh...\n\nSaat sang pahlawan melanjutkan perjalanannya ke dalam hutan yang dalam, dia menemukan sebuah pondok tua yang misterius. Sinar bulan menyinari atap jerami yang sudah lapuk.";
      case "english":
      default:
        return "Once upon a time in a distant land...\n\nAs the hero ventured deeper into the forest, they discovered an old mysterious cottage. Moonlight illuminated its thatched roof.";
    }
  };

  const getCountLabel = () => {
    if (paragraphCount === 0) return "";
    return language === "indonesian"
      ? `📝 ${paragraphCount} paragraf terdeteksi — setiap paragraf jadi 1 gambar!`
      : `📝 ${paragraphCount} paragraphs detected — each becomes 1 image!`;
  };

  const getLabelText = () => {
    return language === "indonesian" ? "Ceritamu di Sini 👇" : "Your Story Here 👇";
  };

  const showValidationWarning =
    language === "indonesian" &&
    story.trim().length > 0 &&
    validation &&
    !validation.isLikelyIndonesianSentence;

  return (
    <div className="space-y-2">
      <label className="text-kid-base font-semibold text-foreground">{getLabelText()}</label>
      <div className="relative">
        <Textarea
          placeholder={getPlaceholderByLanguage()}
          value={story}
          onChange={(e) => onStoryChange(e.target.value)}
          className="min-h-[280px] text-kid-sm rounded-2xl border-2 border-input focus:border-primary/50 bg-card p-4 resize-y placeholder:text-muted-foreground/60"
          disabled={isGenerating}
        />
        {story.trim().length === 0 && (
          <div className="absolute bottom-4 right-4 text-2xl pointer-events-none animate-bounce-gentle">
            ✏️
          </div>
        )}
      </div>

      {showValidationWarning && (
        <p className="text-kid-xs text-fun-coral bg-fun-coral-light rounded-xl px-3 py-2">
          ⚠️ Teks terdeteksi kurang natural dalam bahasa Indonesia.
          {validation.reasons[0] ? ` ${validation.reasons[0]}.` : ""}
        </p>
      )}

      {paragraphCount > 0 && (
        <p className="text-kid-xs text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
          {getCountLabel()}
        </p>
      )}
    </div>
  );
};
