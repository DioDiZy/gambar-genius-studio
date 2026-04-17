import { useStoryImages } from "@/hooks/useStoryImages";
import { BookSpreadView } from "./StoryPreview/BookSpreadView";
import { StoryPreviewActions } from "./StoryPreview/StoryPreviewActions";

interface StoryImagesPreviewProps {
  imageUrls: string[];
  prompts: string[];
  isGenerating: boolean;
  onSaved: () => void;
}

export const StoryImagesPreview = ({
  imageUrls,
  prompts,
  isGenerating,
  onSaved,
}: StoryImagesPreviewProps) => {
  const {
    currentIndex,
    saving,
    handleSave,
    handleDownload,
    handleDownloadAll,
    handleSelectImage,
  } = useStoryImages({ onSaved });

  const currentImage = imageUrls[currentIndex];
  const currentPrompt = prompts[currentIndex];
  const hasContent = imageUrls.length > 0;

  return (
    <section className="space-y-6">
      {/* Section header */}
      <header className="flex items-end justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            Your Storybook
          </p>
          <h2 className="font-heading text-2xl md:text-3xl text-foreground">
            {hasContent
              ? `${imageUrls.length} ${imageUrls.length === 1 ? "page" : "pages"}`
              : "Waiting for your story"}
          </h2>
        </div>
        {hasContent && (
          <p className="text-sm text-muted-foreground hidden sm:block">
            Page {currentIndex + 1} of {imageUrls.length}
          </p>
        )}
      </header>

      {/* Spreads */}
      <BookSpreadView
        imageUrls={imageUrls}
        prompts={prompts}
        currentIndex={currentIndex}
        isGenerating={isGenerating}
        onSelectImage={handleSelectImage}
      />

      {/* Actions */}
      {hasContent && (
        <StoryPreviewActions
          imageUrls={imageUrls}
          currentImage={currentImage}
          currentPrompt={currentPrompt}
          saving={saving}
          onSave={handleSave}
          onDownload={handleDownload}
          onDownloadAll={() => handleDownloadAll(imageUrls)}
          viewMode="storyboard"
        />
      )}
    </section>
  );
};
