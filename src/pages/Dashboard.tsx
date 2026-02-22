
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Buat Gambar AI</h1>
      </div>

      <Tabs defaultValue="single" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="single">Gambar Tunggal</TabsTrigger>
          <TabsTrigger value="story">Cerita ke Gambar</TabsTrigger>
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

      <Gallery userImages={userImages} />
    </DashboardLayout>
  );
};

export default Dashboard;
