import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeneratorForm } from "@/components/ImageGenerator/GeneratorForm";
import { ImagePreview } from "@/components/ImageGenerator/ImagePreview";
import { Gallery } from "@/components/Gallery/Gallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoryGenerator } from "@/components/ImageGenerator/StoryGenerator";
import { StoryImagesPreview } from "@/components/ImageGenerator/StoryImagesPreview";
import { StoryboardAnalyzer } from "@/components/ImageGenerator/StoryboardAnalyzer";

const Dashboard = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");

  const [storyImageUrls, setStoryImageUrls] = useState<string[]>([]);
  const [storyPrompts, setStoryPrompts] = useState<string[]>([]);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  const { data: userImages, refetch: refetchImages } = useQuery({
    queryKey: ["userImages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  const handleImageGenerated = (url: string, prompt: string) => {
    setGeneratedImageUrl(url);
    setCurrentPrompt(prompt);
  };

  const handleStoryImagesGenerated = (urls: string[], prompts: string[]) => {
    setStoryImageUrls(urls);
    setStoryPrompts(prompts);
  };

  const handleStructuredDataGenerated = (data: any) => {
    setStructuredData(data);
    setShowAnalyzer(true);
  };

  const handleImageSaved = () => {
    refetchImages();
    setStoryImageUrls([]);
    setStoryPrompts([]);
    setStructuredData(null);
    setShowAnalyzer(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase.from("images").delete().eq("id", imageId);
      if (error) throw error;
      toast.success("Gambar berhasil dihapus");
      refetchImages();
    } catch (error) {
      toast.error("Gagal menghapus gambar");
    }
  };

  return (
    <DashboardLayout>
      {/* Editorial intro */}
      <header className="mb-10 max-w-2xl">
        <p className="font-heading text-xs uppercase tracking-[0.22em] text-muted-foreground mb-3">
          Studio Cerita
        </p>
        <h1 className="font-heading text-3xl md:text-4xl text-foreground leading-tight">
          Ubah ceritamu menjadi gambar.
        </h1>
        <p className="text-base text-muted-foreground mt-3 leading-relaxed">
          Tulis cerita paragraf demi paragraf. Setiap paragraf akan menjadi satu halaman bergambar di buku ceritamu.
        </p>
      </header>

      <Tabs defaultValue="story" className="mb-12">
        <TabsList className="mb-8 inline-flex w-fit gap-1 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="story"
            className="rounded-md px-4 py-1.5 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Buku Cerita
          </TabsTrigger>
          <TabsTrigger
            value="single"
            className="rounded-md px-4 py-1.5 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Satu Gambar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid lg:grid-cols-2 gap-10">
            <GeneratorForm
              onImageGenerated={handleImageGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
            <ImagePreview
              imageUrl={generatedImageUrl}
              prompt={currentPrompt}
              isGenerating={isGenerating}
              onSaved={handleImageSaved}
            />
          </div>
        </TabsContent>

        <TabsContent value="story">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-10 lg:gap-14">
            <StoryGenerator
              onImagesGenerated={handleStoryImagesGenerated}
              onStructuredDataGenerated={handleStructuredDataGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
            <StoryImagesPreview
              imageUrls={storyImageUrls}
              prompts={storyPrompts}
              isGenerating={isGenerating}
              onSaved={handleImageSaved}
            />
          </div>
          {showAnalyzer && (
            <div className="mt-12">
              <StoryboardAnalyzer
                storyboardData={structuredData}
                isVisible={showAnalyzer}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Gallery userImages={userImages} onDeleteImage={handleDeleteImage} />
    </DashboardLayout>
  );
};

export default Dashboard;
