
import { useState } from "react";
import { GeneratorForm } from "@/components/ImageGenerator/GeneratorForm";
import { StoryGenerator } from "@/components/ImageGenerator/StoryGenerator";
import { StoryImagesPreview } from "@/components/ImageGenerator/StoryImagesPreview";
import { ImagePreview } from "@/components/ImageGenerator/ImagePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";

export default function Dashboard() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [storyImageUrls, setStoryImageUrls] = useState<string[]>([]);
  const [storyPrompts, setStoryPrompts] = useState<string[]>([]);
  const [storyCharacterDescriptions, setStoryCharacterDescriptions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageGenerated = (url: string, prompt: string) => {
    setCurrentImageUrl(url);
    setCurrentPrompt(prompt);
  };

  const handleStoryImagesGenerated = (urls: string[], prompts: string[], characterDescriptions: string[] = []) => {
    setStoryImageUrls(urls);
    setStoryPrompts(prompts);
    setStoryCharacterDescriptions(characterDescriptions);
  };

  const handleImageSaved = () => {
    toast.success("Image saved successfully!");
    // Reset the current image after saving
    setCurrentImageUrl("");
    setCurrentPrompt("");
  };

  const handleStoryImagesSaved = () => {
    toast.success("Story images saved successfully!");
    // Reset story images after saving
    setStoryImageUrls([]);
    setStoryPrompts([]);
    setStoryCharacterDescriptions([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              AI Image Generator
            </h1>
            <p className="text-muted-foreground text-lg">
              Create stunning images with AI or generate complete storyboards from your stories
            </p>
          </div>

          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="single">Single Image</TabsTrigger>
              <TabsTrigger value="story">Story to Images</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <GeneratorForm
                    onImageGenerated={handleImageGenerated}
                    isGenerating={isGenerating}
                    setIsGenerating={setIsGenerating}
                  />
                </div>
                <div>
                  <ImagePreview
                    imageUrl={currentImageUrl}
                    prompt={currentPrompt}
                    isGenerating={isGenerating}
                    onSaved={handleImageSaved}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="story" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <StoryGenerator
                    onImagesGenerated={handleStoryImagesGenerated}
                    isGenerating={isGenerating}
                    setIsGenerating={setIsGenerating}
                  />
                </div>
                <div>
                  <StoryImagesPreview
                    imageUrls={storyImageUrls}
                    prompts={storyPrompts}
                    characterDescriptions={storyCharacterDescriptions}
                    isGenerating={isGenerating}
                    onSaved={handleStoryImagesSaved}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
