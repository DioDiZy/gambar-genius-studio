
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateImage, saveGeneratedImage } from "@/services/ImageService";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download, Heart } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [saving, setSaving] = useState(false);

  // Query to fetch user's generated images
  const { data: userImages, refetch: refetchImages } = useQuery({
    queryKey: ["userImages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setGeneratedImageUrl("");
      
      toast.info("Generating your image...", {
        description: "This may take a few moments"
      });
      
      const imageUrl = await generateImage({ 
        prompt, 
        style, 
        aspectRatio 
      });
      
      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        toast.success("Image generated successfully!");
      } else {
        toast.error("Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Error generating image", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImageUrl) return;
    
    try {
      setSaving(true);
      toast.info("Saving your image...");
      
      await saveGeneratedImage(generatedImageUrl, prompt);
      
      // Refetch the user's images to update the gallery
      refetchImages();
      
      toast.success("Image saved to your gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Error saving image", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "generated-image.webp";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Create AI Images</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <Card>
          <CardHeader>
            <CardTitle>Image Prompt</CardTitle>
            <CardDescription>
              Describe the image you want to generate in detail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="A futuristic city with flying cars and neon lights, cyberpunk style, 8k, detailed..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32 mb-4"
              disabled={isGenerating}
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="photorealistic">Photorealistic</option>
                  <option value="digital-art">Digital Art</option>
                  <option value="anime">Anime</option>
                  <option value="3d-render">3D Render</option>
                  <option value="oil-painting">Oil Painting</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aspect Ratio</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="1:1">Square (1:1)</option>
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
                  <option value="4:3">Standard (4:3)</option>
                </select>
              </div>
            </div>
            <CustomButton
              variant="gradient"
              className="w-full"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Image"}
            </CustomButton>
          </CardContent>
        </Card>

        {/* Right Column - Output */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated image will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-muted/30 aspect-square flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center p-6">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted-foreground">Creating your masterpiece...</p>
                  </div>
                </div>
              ) : generatedImageUrl ? (
                <img 
                  src={generatedImageUrl} 
                  alt="Generated" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-muted-foreground text-sm">
                    Your generated image will appear here
                  </p>
                </div>
              )}
            </div>
            {generatedImageUrl && (
              <div className="flex justify-between mt-4">
                <CustomButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(generatedImageUrl)}
                >
                  Download
                </CustomButton>
                <CustomButton 
                  variant="gradient" 
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save to Gallery"}
                </CustomButton>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gallery Section */}
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
    </DashboardLayout>
  );
};

// Gallery Components
interface GalleryItemProps {
  imageUrl: string;
  prompt: string;
}

const GalleryItem = ({ imageUrl, prompt }: GalleryItemProps) => {
  return (
    <div className="relative group overflow-hidden rounded-lg">
      <img 
        src={imageUrl} 
        alt={prompt} 
        className="aspect-square w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <div className="text-white text-xs truncate mb-1">
          {prompt}
        </div>
        <div className="flex justify-between">
          <button className="text-white text-xs hover:underline flex items-center gap-1">
            <Download className="h-3 w-3" />
            Download
          </button>
          <button className="text-white text-xs hover:underline flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Favorite
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyGalleryState = ({ message = "No images yet" }) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <div className="text-4xl mb-2 opacity-50">🖼️</div>
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-1">
        Images you create will appear here
      </p>
    </div>
  );
};

export default Dashboard;
