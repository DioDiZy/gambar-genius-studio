
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GalleryItemProps {
  id?: string;
  imageUrl: string;
  prompt: string;
  createdAt?: string;
  onDelete?: (id: string) => void;
}

export const GalleryItem = ({ id, imageUrl, prompt, createdAt, onDelete }: GalleryItemProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleDownload = () => {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || `gambar-ai-${Date.now()}.webp`;
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Gambar berhasil diunduh");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh gambar");
    }
  };

  const handleDelete = () => {
    if (id && onDelete) {
      onDelete(id);
    }
  };

  return (
    <div 
      className="relative group overflow-hidden rounded-lg aspect-square"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img 
        src={imageUrl} 
        alt={prompt} 
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        loading="lazy"
      />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'} flex flex-col justify-end p-3`}>
        <div className="text-white text-xs line-clamp-2 mb-2">{prompt}</div>
        <div className="flex justify-between items-center">
          <button onClick={handleDownload} className="text-white text-xs hover:text-blue-300 flex items-center gap-1 transition-colors">
            <Download className="h-3 w-3" />
            Unduh
          </button>
          {id && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-white text-xs hover:text-red-400 flex items-center gap-1 transition-colors">
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Gambar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Gambar ini akan dihapus permanen dari galeri Anda. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};
