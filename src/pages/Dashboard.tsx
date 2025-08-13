
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

// Define supported languages to maintain consistency
type SupportedLanguage = "english" | "indonesian";

const Dashboard = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("english");
  
  // For story-based image generation
  const [storyImageUrls, setStoryImageUrls] = useState<string[]>([]);
  const [storyPrompts, setStoryPrompts] = useState<string[]>([]);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  // Query to fetch user's generated images with optimized settings
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
    staleTime: 60000, // Data considered fresh for 1 minute
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
    // Refetch the user's images to update the gallery
    refetchImages();
    // Clear story data when images are saved
    setStoryImageUrls([]);
    setStoryPrompts([]);
    setStructuredData(null);
    setShowAnalyzer(false);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">
        {language === "indonesian" ? "Buat Gambar AI" : "Create AI Images"}
      </h1>

      <Tabs defaultValue="single" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="single">
            {language === "indonesian" ? "Gambar Tunggal" : "Single Image"}
          </TabsTrigger>
          <TabsTrigger value="story">
            {language === "indonesian" ? "Cerita ke Gambar" : "Story to Images"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Single Image Generation */}
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
              language={language}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="story">
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Story-based Image Generation */}
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
            
            {/* Storyboard Analysis */}
            <StoryboardAnalyzer
              storyboardData={structuredData}
              isVisible={showAnalyzer}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Gallery Section */}
      <Gallery userImages={userImages} />
    </DashboardLayout>
  );
};

export default Dashboard;
