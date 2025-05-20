
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
}

export const StoryTextArea = ({
  story,
  onStoryChange,
  paragraphCount,
  isGenerating,
}: StoryTextAreaProps) => {
  const { language, t } = useLanguage();

  const getPlaceholderByLanguage = () => {
    switch(language) {
      case "indonesian":
        return "Pada suatu hari di negeri yang jauh...\n\nSaat sang pahlawan melanjutkan perjalanannya ke dalam hutan yang dalam, dia menemukan sebuah pondok tua yang misterius. Sinar bulan menyinari atap jerami yang sudah lapuk.";
      case "english":
      default:
        return "Once upon a time in a distant land...\n\nAs the hero ventured deeper into the forest, they discovered an old mysterious cottage. Moonlight illuminated its thatched roof.";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{t("story.yourStory")}</Label>
      <Textarea
        placeholder={getPlaceholderByLanguage()}
        value={story}
        onChange={(e) => onStoryChange(e.target.value)}
        className="min-h-64 mb-4"
        disabled={isGenerating}
      />
      <p className="text-sm text-muted-foreground">
        {t("story.paragraphsDetected").replace("{count}", paragraphCount.toString())}
      </p>
    </div>
  );
};
