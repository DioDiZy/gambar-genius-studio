
interface EmptyGalleryStateProps {
  message?: string;
}

export const EmptyGalleryState = ({ message = "No images yet" }: EmptyGalleryStateProps) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <div className="text-4xl mb-2 opacity-50">🖼️</div>
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-1">
        Images you create will appear here
      </p>
    </div>
  );
};
