
import { Download, Save } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

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
    <div className="mt-4 space-y-4">
      {viewMode === 'single' && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          Prompt: {currentPrompt}
        </p>
      )}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <CustomButton variant="outline" size="sm" onClick={() => onDownload(currentImage)}>
            <Download className="mr-2 h-4 w-4" />
            Unduh
          </CustomButton>
          {imageUrls.length > 1 && (
            <CustomButton variant="outline" size="sm" onClick={onDownloadAll}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Semua
            </CustomButton>
          )}
        </div>
        <CustomButton 
          variant="gradient" 
          size="sm"
          onClick={() => onSave(currentImage, currentPrompt)}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Menyimpan..." : "Simpan ke Galeri"}
        </CustomButton>
      </div>
    </div>
  );
};
