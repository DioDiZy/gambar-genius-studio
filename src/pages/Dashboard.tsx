
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeneratorForm } from "@/components/ImageGenerator/GeneratorForm";
import { ImagePreview } from "@/components/ImageGenerator/ImagePreview";
import { Gallery } from "@/components/Gallery/Gallery";

const Dashboard = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

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

  const handleImageGenerated = (url: string) => {
    setGeneratedImageUrl(url);
  };

  const handleImageSaved = () => {
    // Refetch the user's images to update the gallery
    refetchImages();
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">Create AI Images</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Input */}
        <GeneratorForm 
          onImageGenerated={handleImageGenerated}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />

        {/* Right Column - Output */}
        <ImagePreview 
          imageUrl={generatedImageUrl}
          isGenerating={isGenerating}
          onSaved={handleImageSaved}
        />
      </div>

      {/* Gallery Section */}
      <Gallery userImages={userImages} />
    </DashboardLayout>
  );
};

export default Dashboard;
