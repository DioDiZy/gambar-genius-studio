
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface StoryGenerationButtonProps {
  onGenerate: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  language?: string;
}

export const StoryGenerationButton = ({
  onGenerate,
  disabled = false,
  isGenerating = false,
  language = "english"
}: StoryGenerationButtonProps) => {
  const buttonText = () => {
    if (language === "indonesian") {
      return isGenerating ? "Menghasilkan..." : "Hasilkan Gambar";
    }
    return isGenerating ? "Generating..." : "Generate Images";
  };

  return (
    <Button
      onClick={onGenerate}
      disabled={disabled || isGenerating}
      className="gap-2"
      size="lg"
    >
      <Sparkles className="h-4 w-4" />
      {buttonText()}
    </Button>
  );
};
