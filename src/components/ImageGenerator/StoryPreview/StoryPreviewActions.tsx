import { Download, Save, BookOpen, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryPreviewActionsProps {
  imageUrls: string[];
  currentImage: string;
  currentPrompt: string;
  saving: boolean;
  onSave: (imageUrl: string, prompt: string) => Promise<void>;
  onDownload: (imageUrl: string) => void;
  onDownloadAll: () => void;
  onOpenReader: () => void;
  onExportPdf: () => void;
  exportingPdf?: boolean;
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
  onOpenReader,
  onExportPdf,
  exportingPdf,
}: StoryPreviewActionsProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border/60">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onOpenReader}
          className="rounded-lg"
        >
          <BookOpen className="mr-1.5 h-4 w-4" />
          Mode baca
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          disabled={exportingPdf}
          className="rounded-lg"
        >
          <FileDown className="mr-1.5 h-4 w-4" />
          {exportingPdf ? "Membuat PDF…" : "Ekspor PDF"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(currentImage)}
          className="rounded-lg"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Unduh halaman
        </Button>
        {imageUrls.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadAll}
            className="rounded-lg"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Unduh semua
          </Button>
        )}
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onSave(currentImage, currentPrompt)}
        disabled={saving}
        className="rounded-lg"
      >
        <Save className="mr-1.5 h-4 w-4" />
        {saving ? "Menyimpan…" : "Simpan ke galeri"}
      </Button>
    </div>
  );
};
