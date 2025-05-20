
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StoryGenerationButtonProps {
  onGenerate: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export const StoryGenerationButton = ({
  onGenerate,
  disabled = false,
  isGenerating = false,
}: StoryGenerationButtonProps) => {
  const { t } = useLanguage();

  return (
    <Button
      onClick={onGenerate}
      disabled={disabled || isGenerating}
      className="gap-2"
      size="lg"
    >
      <Sparkles className="h-4 w-4" />
      {isGenerating ? t("story.generating") : t("story.generate")}
    </Button>
  );
};
