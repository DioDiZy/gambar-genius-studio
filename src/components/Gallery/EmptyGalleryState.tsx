
interface EmptyGalleryStateProps {
  message?: string;
}

export const EmptyGalleryState = ({ message = "Belum ada gambar" }: EmptyGalleryStateProps) => {
  const isSearchResult = message.toLowerCase().includes("tidak ada gambar yang cocok");
  
  return (
    <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
      <div className="text-5xl mb-4 opacity-50">
        {isSearchResult ? '🔍' : '🖼️'}
      </div>
      <p className="text-xl text-muted-foreground font-medium">{message}</p>
      {isSearchResult ? (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Coba cari dengan kata kunci lain atau hapus pencarian untuk melihat semua gambar
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Buat gambar AI yang menakjubkan dan gambar akan muncul di galeri Anda
        </p>
      )}
    </div>
  );
};
