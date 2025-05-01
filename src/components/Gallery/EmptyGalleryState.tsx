
interface EmptyGalleryStateProps {
  message?: string;
}

export const EmptyGalleryState = ({ message = "No images yet" }: EmptyGalleryStateProps) => {
  const isSearchResult = message.toLowerCase().includes("no matching");
  
  return (
    <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
      <div className="text-5xl mb-4 opacity-50">
        {isSearchResult ? '🔍' : '🖼️'}
      </div>
      <p className="text-xl text-muted-foreground font-medium">{message}</p>
      {isSearchResult ? (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Try searching with different keywords or clear your search to see all images
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Generate amazing AI images and they will appear in your gallery for easy access later
        </p>
      )}
    </div>
  );
};
