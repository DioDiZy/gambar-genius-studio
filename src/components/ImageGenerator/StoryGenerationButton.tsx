import { Loader2 } from "lucide-react";

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
}: StoryGenerationButtonProps) => {
  const buttonText = isGenerating
    ? "Sedang membuat buku ceritamu…"
    : "Buat Buku Ceritaku";

  return (
    <button
      onClick={onGenerate}
      disabled={disabled || isGenerating}
      className="
        inline-flex items-center justify-center gap-2.5
        bg-primary text-primary-foreground
        text-base font-medium
        px-7 py-3.5
        rounded-xl
        shadow-sm
        hover:bg-primary/90
        active:scale-[0.99]
        transition-all duration-150
        disabled:opacity-50 disabled:pointer-events-none
        w-full sm:w-auto
      "
    >
      {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{buttonText}</span>
    </button>
  );
};
