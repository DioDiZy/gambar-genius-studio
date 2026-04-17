import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryPreviewActionsProps {
  imageUrls: string[];
  currentImage: string;
  currentPrompt: string;
  saving: boolean;
  onSave: (imageUrl: string, prompt: string) => Promise<void>;
  onDownload: (imageUrl: string) => void;
  onDownloadAll: () => void;
  viewMode: "single" | "storyboard";
}

export const StoryPreviewActions = ({
  imageUrls,
  currentImage,
  currentPrompt,
  saving,
  onSave,
  onDownload,
  onDownloadAll,
}: StoryPreviewActionsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border/60">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(currentImage)}
          className="rounded-lg"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Download page
        </Button>
        {imageUrls.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadAll}
            className="rounded-lg"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download all
          </Button>
        )}
      </div>
      <Button
        size="sm"
        onClick={() => onSave(currentImage, currentPrompt)}
        disabled={saving}
        className="rounded-lg"
      >
        <Save className="mr-1.5 h-4 w-4" />
        {saving ? "Saving…" : "Save to gallery"}
      </Button>
    </div>
  );
};
