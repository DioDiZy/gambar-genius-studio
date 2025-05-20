
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
  language?: string;
}

export const StoryTextArea = ({
  story,
  onStoryChange,
  paragraphCount,
  isGenerating,
  language = "english"
}: StoryTextAreaProps) => {
  const getPlaceholderByLanguage = () => {
    switch(language) {
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

  return (
    <div className="space-y-2">
      <Label>{getLabelText()}</Label>
      <Textarea
        placeholder={getPlaceholderByLanguage()}
        value={story}
        onChange={(e) => onStoryChange(e.target.value)}
        className="min-h-64 mb-4"
        disabled={isGenerating}
      />
      <p className="text-sm text-muted-foreground">
        {getCountLabel()}
      </p>
    </div>
  );
};
