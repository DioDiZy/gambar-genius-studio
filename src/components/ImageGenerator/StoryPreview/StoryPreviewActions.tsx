
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
  viewMode: 'single' | 'storyboard';
}

export const StoryPreviewActions = ({
  imageUrls,
  currentImage,
  currentPrompt,
  saving,
  onSave,
  onDownload,
  onDownloadAll,
  viewMode,
}: StoryPreviewActionsProps) => {
  return (
    <div className="mt-5 space-y-4">
      {viewMode === 'single' && (
        <p className="text-kid-xs text-muted-foreground line-clamp-3 bg-muted/30 rounded-xl px-3 py-2">
          💡 Prompt: {currentPrompt}
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDownload(currentImage)}
            className="rounded-xl text-kid-xs"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Unduh
          </Button>
          {imageUrls.length > 1 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownloadAll}
              className="rounded-xl text-kid-xs"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Unduh Semua
            </Button>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => onSave(currentImage, currentPrompt)}
          disabled={saving}
          className="rounded-xl text-kid-xs bg-gradient-to-r from-primary to-fun-teal text-primary-foreground hover:opacity-90"
        >
          <Save className="mr-1.5 h-4 w-4" />
          {saving ? "Menyimpan..." : "💾 Simpan ke Galeri"}
        </Button>
      </div>
    </div>
  );
};
