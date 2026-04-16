
import { BookText } from "lucide-react";
import { useStoryImages } from "@/hooks/useStoryImages";
import { SingleImageView } from "./StoryPreview/SingleImageView";
import { StoryboardView } from "./StoryPreview/StoryboardView";
import { StoryPreviewActions } from "./StoryPreview/StoryPreviewActions";
import { ViewModeToggle } from "./StoryPreview/ViewModeToggle";
import { StoryboardContinuity } from "./StoryboardContinuity";
import { StoryboardAnalyzer } from "./StoryboardAnalyzer";

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
  onSaved 
}: StoryImagesPreviewProps) => {
  const {
    currentIndex,
    saving,
    viewMode,
    setViewMode,
    handleSave,
    handleDownload,
    handleDownloadAll,
    handleNext,
    handlePrevious,
    handleSelectImage
  } = useStoryImages({ onSaved });

  const currentImage = imageUrls[currentIndex];
  const currentPrompt = prompts[currentIndex];

  return (
    <div className="fun-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-fun-teal-light to-fun-blue-light px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-fun-teal/10 p-2 rounded-xl">
              <BookText className="h-5 w-5 text-fun-teal" />
            </div>
            <div>
              <h2 className="text-kid-lg font-bold text-foreground">
                Hasil Gambarmu 🖼️
                {imageUrls.length > 0 && (
                  <span className="text-kid-sm font-normal text-muted-foreground ml-2">
                    ({currentIndex + 1}/{imageUrls.length})
                  </span>
                )}
              </h2>
              <p className="text-kid-xs text-muted-foreground">
                Gambar storyboard dari ceritamu muncul di sini!
              </p>
            </div>
          </div>
          {imageUrls.length > 0 && (
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          )}
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'single' ? (
          <SingleImageView
            imageUrls={imageUrls}
            prompts={prompts}
            currentIndex={currentIndex}
            isGenerating={isGenerating}
            onPrevious={() => handlePrevious(imageUrls.length)}
            onNext={() => handleNext(imageUrls.length)}
          />
        ) : (
          <StoryboardView
            imageUrls={imageUrls}
            prompts={prompts}
            currentIndex={currentIndex}
            isGenerating={isGenerating}
            onSelectImage={handleSelectImage}
          />
        )}

        {imageUrls.length > 0 && (
          <>
            <StoryPreviewActions
              imageUrls={imageUrls}
              currentImage={currentImage}
              currentPrompt={currentPrompt}
              saving={saving}
              onSave={handleSave}
              onDownload={handleDownload}
              onDownloadAll={() => handleDownloadAll(imageUrls)}
              viewMode={viewMode}
            />
            <StoryboardContinuity
              imageUrls={imageUrls}
              prompts={prompts}
              currentIndex={currentIndex}
            />
          </>
        )}
      </div>
    </div>
  );
};
