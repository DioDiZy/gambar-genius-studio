
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
import { Sparkles, BookOpen } from "lucide-react";

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
      if (error) {
        console.error("Error fetching images:", error);
        throw error;
      }
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
      console.error("Delete error:", error);
      toast.error("Gagal menghapus gambar");
    }
  };

  return (
    <DashboardLayout>
      {/* Fun welcome header */}
      <div className="mb-8 text-center">
        <h1 className="text-kid-2xl font-bold gradient-text mb-2">
          ✨ Buat Gambar dari Imajinasimu! ✨
        </h1>
        <p className="text-kid-base text-muted-foreground max-w-xl mx-auto">
          Tulis cerita seru, lalu lihat ceritamu berubah jadi gambar keren!
        </p>
      </div>

      <Tabs defaultValue="story" className="mb-8">
        <TabsList className="mb-6 mx-auto flex w-fit gap-2 bg-muted/50 p-1.5 rounded-2xl">
          <TabsTrigger 
            value="single" 
            className="rounded-xl px-5 py-2.5 text-kid-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Gambar Tunggal
          </TabsTrigger>
          <TabsTrigger 
            value="story" 
            className="rounded-xl px-5 py-2.5 text-kid-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Cerita ke Gambar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid lg:grid-cols-2 gap-8">
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
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
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
            <StoryboardAnalyzer
              storyboardData={structuredData}
              isVisible={showAnalyzer}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Gallery userImages={userImages} onDeleteImage={handleDeleteImage} />
    </DashboardLayout>
  );
};

export default Dashboard;
