
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GalleryItem } from "./GalleryItem";
import { EmptyGalleryState } from "./EmptyGalleryState";

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userImages.map((item, index) => (
                <GalleryItem 
                  key={index} 
                  imageUrl={item.image_url} 
                  prompt={item.prompt} 
                />
              ))}
            </div>
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
