
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryItem } from "./GalleryItem";
import { EmptyGalleryState } from "./EmptyGalleryState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface GalleryProps {
  userImages: Array<{
    id?: string;
    user_id?: string;
    image_url: string;
    prompt: string;
    created_at?: string;
  }> | undefined;
  onDeleteImage?: (id: string) => void;
}

export const Gallery = ({ userImages, onDeleteImage }: GalleryProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const imagesPerPage = 8;
  
  const filteredImages = userImages ? 
    userImages.filter(img => img.prompt.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * imagesPerPage, 
    currentPage * imagesPerPage
  );
  
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Galeri Anda</h2>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari berdasarkan prompt..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 w-full"
          />
        </div>
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Gambar Terbaru</TabsTrigger>
          <TabsTrigger value="favorite">Favorit</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          {filteredImages.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedImages.map((item, index) => (
                  <GalleryItem 
                    key={item.id || index}
                    id={item.id}
                    imageUrl={item.image_url} 
                    prompt={item.prompt} 
                    createdAt={item.created_at}
                    onDelete={onDeleteImage}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => handlePageChange(i + 1)}
                          isActive={currentPage === i + 1}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <EmptyGalleryState 
              message={searchQuery ? "Tidak ada gambar yang cocok" : "Belum ada gambar"} 
            />
          )}
        </TabsContent>

        <TabsContent value="favorite">
          <EmptyGalleryState message="Belum ada gambar favorit" />
        </TabsContent>
      </Tabs>
    </section>
  );
};
