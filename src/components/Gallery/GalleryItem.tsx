
import { Download, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GalleryItemProps {
  imageUrl: string;
  prompt: string;
  createdAt?: string;
}

export const GalleryItem = ({ imageUrl, prompt, createdAt }: GalleryItemProps) => {
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

  const handleAddToFavorites = () => {
    toast.info("Fitur favorit segera hadir!");
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
          <button onClick={handleAddToFavorites} className="text-white text-xs hover:text-red-300 flex items-center gap-1 transition-colors">
            <Heart className="h-3 w-3" />
            Favorit
          </button>
        </div>
      </div>
    </div>
  );
};
