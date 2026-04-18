import { useState, useMemo } from "react";
import { useStoryImages } from "@/hooks/useStoryImages";
import { BookSpreadView } from "./StoryPreview/BookSpreadView";
import { StoryPreviewActions } from "./StoryPreview/StoryPreviewActions";
import { FullscreenReader } from "./StoryPreview/FullscreenReader";
import { exportStorybookAsPdf } from "@/utils/exportStorybookPdf";

interface StoryImagesPreviewProps {
  imageUrls: string[];
  prompts: string[];
  isGenerating: boolean;
  onSaved: () => void;
}

/**
 * Derive a short, friendly title from the first paragraph.
 * Falls back to a default if no usable text is found.
 */
const deriveTitle = (prompts: string[]): string => {
  const first = (prompts[0] ?? "").trim();
  if (!first) return "Buku Ceritaku";
  // Take first sentence
  const sentence = first.split(/[.!?\n]/)[0].trim();
  const words = sentence.split(/\s+/).slice(0, 8).join(" ");
  return words.length > 0 ? words : "Buku Ceritaku";
};

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

  const [readerOpen, setReaderOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const currentImage = imageUrls[currentIndex];
  const currentPrompt = prompts[currentIndex];
  const hasContent = imageUrls.length > 0;
  const title = useMemo(() => deriveTitle(prompts), [prompts]);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportStorybookAsPdf({ title, imageUrls, prompts });
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Section header */}
      <header className="flex items-end justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
            Hasil Ceritamu
          </p>
          <h2 className="font-heading text-2xl md:text-3xl text-foreground">
            {hasContent ? title : "Menanti ceritamu"}
          </h2>
        </div>
        {hasContent && (
          <p className="text-sm text-muted-foreground hidden sm:block">
            {imageUrls.length} halaman
          </p>
        )}
      </header>

      {/* Spreads (with cover) */}
      <BookSpreadView
        imageUrls={imageUrls}
        prompts={prompts}
        currentIndex={currentIndex}
        isGenerating={isGenerating}
        onSelectImage={handleSelectImage}
        title={hasContent ? title : undefined}
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
          onOpenReader={() => setReaderOpen(true)}
          onExportPdf={handleExportPdf}
          exportingPdf={exportingPdf}
          viewMode="storyboard"
        />
      )}

      {/* Fullscreen reader */}
      <FullscreenReader
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
        title={title}
        imageUrls={imageUrls}
        prompts={prompts}
      />
    </section>
  );
};
