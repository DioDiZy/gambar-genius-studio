
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryItem } from "./GalleryItem";
import { EmptyGalleryState } from "./EmptyGalleryState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

interface GalleryProps {
  userImages: Array<{
    id?: string;
    user_id?: string;
    image_url: string;
    prompt: string;
    created_at?: string;
  }> | undefined;
}

export const Gallery = ({ userImages }: GalleryProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 8;
  
  const paginatedImages = userImages ? 
    userImages.slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage) : 
    [];
  
  const totalPages = userImages ? Math.ceil(userImages.length / imagesPerPage) : 0;
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Your Gallery</h2>
      <Tabs defaultValue="recent">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent Images</TabsTrigger>
          <TabsTrigger value="favorite">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          {userImages && userImages.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedImages.map((item, index) => (
                  <GalleryItem 
                    key={item.id || index} 
                    imageUrl={item.image_url} 
                    prompt={item.prompt} 
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
            <EmptyGalleryState />
          )}
        </TabsContent>

        <TabsContent value="favorite">
          <EmptyGalleryState message="No favorite images yet" />
        </TabsContent>
      </Tabs>
    </section>
  );
};
