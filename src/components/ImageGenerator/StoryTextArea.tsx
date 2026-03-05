import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  IndonesianValidationResult,
  IndonesianWordValidationResult,
} from "@/utils/indonesianLanguageValidation";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
  language?: string;
  validation?: IndonesianValidationResult;
  wordValidation?: IndonesianWordValidationResult;
}

export const StoryTextArea = ({
  story,
  onStoryChange,
  paragraphCount,
  isGenerating,
  language = "english",
  validation,
  wordValidation,
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
    return language === "indonesian"
      ? `${paragraphCount} paragraf terdeteksi`
      : `${paragraphCount} paragraphs detected`;
  };

  const getLabelText = () => {
    return language === "indonesian" ? "Cerita Anda" : "Your Story";
  };

  const showValidationWarning =
    language === "indonesian" &&
    story.trim().length > 0 &&
    validation &&
    !validation.isLikelyIndonesianSentence;

  const unknownWordsPreview =
    language === "indonesian" && wordValidation?.unknownWords.length
      ? wordValidation.unknownWords.slice(0, 8).join(", ")
      : "";

  return (
    <div className="space-y-2">
      <Label>{getLabelText()}</Label>
      <Textarea
        placeholder={getPlaceholderByLanguage()}
        value={story}
        onChange={(e) => onStoryChange(e.target.value)}
        className="min-h-64 mb-2"
        disabled={isGenerating}
      />

      {showValidationWarning && (
        <p className="text-sm text-amber-600">
          Teks terdeteksi kurang natural dalam bahasa Indonesia.
          {validation.reasons[0] ? ` ${validation.reasons[0]}.` : ""}
        </p>
      )}

      {unknownWordsPreview && (
        <p className="text-sm text-amber-600">
          Kata yang belum dikenali: {unknownWordsPreview}
          {wordValidation && wordValidation.unknownWords.length > 8 ? ", ..." : ""}
        </p>
      )}

      <p className="text-sm text-muted-foreground">{getCountLabel()}</p>
    </div>
  );
};
