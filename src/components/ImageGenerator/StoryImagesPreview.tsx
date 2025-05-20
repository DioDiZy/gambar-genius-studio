
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText } from "lucide-react";
import { useStoryImages } from "@/hooks/useStoryImages";
import { SingleImageView } from "./StoryPreview/SingleImageView";
import { StoryboardView } from "./StoryPreview/StoryboardView";
import { StoryPreviewActions } from "./StoryPreview/StoryPreviewActions";
import { ViewModeToggle } from "./StoryPreview/ViewModeToggle";

interface StoryImagesPreviewProps {
  imageUrls: string[];
  prompts: string[];
  isGenerating: boolean;
  confidenceScores?: number[]; // Added confidence scores prop
  onSaved: () => void;
}

export const StoryImagesPreview = ({ 
  imageUrls, 
  prompts, 
  isGenerating, 
  confidenceScores,
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

  // Getting the current image and prompt
  const currentImage = imageUrls[currentIndex];
  const currentPrompt = prompts[currentIndex];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BookText className="h-5 w-5" />
            Story Images {imageUrls.length > 0 ? `(${currentIndex + 1}/${imageUrls.length})` : ""}
          </CardTitle>
          {imageUrls.length > 0 && (
            <ViewModeToggle 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          )}
        </div>
        <CardDescription>
          Storyboard images generated from your story paragraphs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {viewMode === 'single' ? (
          <SingleImageView
            imageUrls={imageUrls}
            prompts={prompts}
            currentIndex={currentIndex}
            isGenerating={isGenerating}
            confidenceScores={confidenceScores}
            onPrevious={() => handlePrevious(imageUrls.length)}
            onNext={() => handleNext(imageUrls.length)}
          />
        ) : (
          <StoryboardView
            imageUrls={imageUrls}
            prompts={prompts}
            currentIndex={currentIndex}
            isGenerating={isGenerating}
            confidenceScores={confidenceScores}
            onSelectImage={handleSelectImage}
          />
        )}

        {imageUrls.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  );
};
