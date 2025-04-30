
import { DashboardLayout } from "@/components/DashboardLayout";
import { CustomButton } from "@/components/ui/custom-button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate image generation
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImage("placeholder");
    }, 3000);
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
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Style</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="photorealistic">Photorealistic</option>
                  <option value="digital-art">Digital Art</option>
                  <option value="anime">Anime</option>
                  <option value="3d-render">3D Render</option>
                  <option value="oil-painting">Oil Painting</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aspect Ratio</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
              {generatedImage ? (
                <div className="animate-pulse-slow bg-accent/30 w-full h-full flex items-center justify-center text-muted-foreground">
                  Image Generated (placeholder)
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-muted-foreground text-sm">
                    {isGenerating
                      ? "Creating your masterpiece..."
                      : "Your generated image will appear here"}
                  </p>
                </div>
              )}
            </div>
            {generatedImage && (
              <div className="flex justify-between mt-4">
                <CustomButton variant="outline" size="sm">
                  Download
                </CustomButton>
                <CustomButton variant="outline" size="sm">
                  Regenerate
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
            {mockGallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockGallery.map((item, index) => (
                  <GalleryItem key={index} />
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
const GalleryItem = () => {
  return (
    <div className="relative group overflow-hidden rounded-lg">
      <div className="aspect-square bg-accent/30 animate-pulse-slow"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <div className="text-white text-xs truncate mb-1">
          A futuristic city with neon lights...
        </div>
        <div className="flex justify-between">
          <button className="text-white text-xs hover:underline">
            Download
          </button>
          <button className="text-white text-xs hover:underline">
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

// Mock data
const mockGallery = [
  {}, {}, {}, {}
];

export default Dashboard;
