
import { Sparkles, Loader2 } from "lucide-react";

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
      return isGenerating ? "Sedang Membuat Gambar..." : "🎨 Buat Gambar dari Ceritaku!";
    }
    return isGenerating ? "Creating..." : "🎨 Create My Picture!";
  };

  return (
    <button
      onClick={onGenerate}
      disabled={disabled || isGenerating}
      className="
        relative overflow-hidden
        inline-flex items-center justify-center gap-2.5
        bg-gradient-to-r from-primary to-fun-teal
        text-primary-foreground
        text-kid-base font-bold
        px-8 py-4
        rounded-2xl
        shadow-lg shadow-primary/20
        hover:shadow-xl hover:shadow-primary/30
        hover:scale-[1.02]
        active:scale-[0.98]
        transition-all duration-200
        disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none
        w-full sm:w-auto
      "
    >
      {isGenerating ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Sparkles className="h-5 w-5" />
      )}
      <span>{buttonText()}</span>
    </button>
  );
};
