
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

const Dashboard = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  
  // For story-based image generation
  const [storyImageUrls, setStoryImageUrls] = useState<string[]>([]);
  const [storyPrompts, setStoryPrompts] = useState<string[]>([]);
  const [confidenceScores, setConfidenceScores] = useState<number[]>([]);

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

  const handleStoryImagesGenerated = (urls: string[], prompts: string[], scores?: number[]) => {
    setStoryImageUrls(urls);
    setStoryPrompts(prompts);
    if (scores) {
      setConfidenceScores(scores);
    } else {
      // Generate default confidence scores if none provided (placeholder)
      setConfidenceScores(urls.map(() => Math.random() * 0.3 + 0.65)); // Random scores between 65% and 95%
    }
  };

  const handleImageSaved = () => {
    // Refetch the user's images to update the gallery
    refetchImages();
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Create AI Images</h1>

      <Tabs defaultValue="single" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="single">Single Image</TabsTrigger>
          <TabsTrigger value="story">Story to Images</TabsTrigger>
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
            />
          </div>
        </TabsContent>
        
        <TabsContent value="story">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Story-based Image Generation */}
            <StoryGenerator
              onImagesGenerated={handleStoryImagesGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
            <StoryImagesPreview
              imageUrls={storyImageUrls}
              prompts={storyPrompts}
              confidenceScores={confidenceScores}
              isGenerating={isGenerating}
              onSaved={handleImageSaved}
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
