
import { Download, Heart } from "lucide-react";

interface GalleryItemProps {
  imageUrl: string;
  prompt: string;
}

export const GalleryItem = ({ imageUrl, prompt }: GalleryItemProps) => {
  return (
    <div className="relative group overflow-hidden rounded-lg">
      <img 
        src={imageUrl} 
        alt={prompt} 
        className="aspect-square w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <div className="text-white text-xs truncate mb-1">
          {prompt}
        </div>
        <div className="flex justify-between">
          <button className="text-white text-xs hover:underline flex items-center gap-1">
            <Download className="h-3 w-3" />
            Download
          </button>
          <button className="text-white text-xs hover:underline flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Favorite
          </button>
        </div>
      </div>
    </div>
  );
};
