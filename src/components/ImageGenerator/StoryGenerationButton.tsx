
import { CustomButton } from "@/components/ui/custom-button";

interface StoryGenerationButtonProps {
  onGenerate: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

export const StoryGenerationButton = ({
  onGenerate,
  disabled,
  isGenerating
}: StoryGenerationButtonProps) => {
  return (
    <CustomButton
      variant="gradient"
      onClick={onGenerate}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? "Generating..." : "Generate Images"}
    </CustomButton>
  );
};
