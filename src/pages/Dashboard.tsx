import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeneratorForm } from "@/components/ImageGenerator/GeneratorForm";
import { ImagePreview } from "@/components/ImageGenerator/ImagePreview";
import { Gallery } from "@/components/Gallery/Gallery";
import { StoryGenerator } from "@/components/ImageGenerator/StoryGenerator";
import { StoryImagesPreview } from "@/components/ImageGenerator/StoryImagesPreview";
import { StoryboardAnalyzer } from "@/components/ImageGenerator/StoryboardAnalyzer";
import { Sparkles } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");

  const [storyImageUrls, setStoryImageUrls] = useState<string[]>([]);
  const [storyPrompts, setStoryPrompts] = useState<string[]>([]);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");

  const { data: userImages, refetch: refetchImages } = useQuery({
    queryKey: ["userImages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("images").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
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
    setStoryTitle("");
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
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute left-[10%] top-[10%] h-64 w-64 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute right-[5%] top-[20%] h-80 w-80 rounded-full bg-violet-100/40 blur-3xl" />
      </div>

      <div className="relative">
        {/* Editorial Intro */}
        <header className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-orange-600 shadow-sm backdrop-blur">
            <Sparkles size={14} className="animate-pulse" />
            <span className="uppercase tracking-wider">Studio Imajinasi Ajaib</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-slate-800 md:text-5xl lg:max-w-3xl">
            Halo, {user?.email?.split("@")[0]}! Mari ubah
            <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">ceritamu menjadi gambar.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">Tulis petualanganmu paragraf demi paragraf. Setiap bagian akan berubah menjadi halaman ajaib dalam buku ceritamu.</p>
        </header>

        {/* Buku Cerita Section */}
        <div className="mb-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14">
            <div className="rounded-[32px] border border-white/70 bg-white/60 p-1 shadow-xl backdrop-blur-md">
              <StoryGenerator
                onImagesGenerated={handleStoryImagesGenerated}
                onStructuredDataGenerated={handleStructuredDataGenerated}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                storyTitle={storyTitle}
                onStoryTitleChange={setStoryTitle}
              />
            </div>
            <StoryImagesPreview
              imageUrls={storyImageUrls}
              prompts={storyPrompts}
              isGenerating={isGenerating}
              onSaved={handleImageSaved}
              externalTitle={storyTitle}
            />
          </div>
        </div>

        {/* Gallery Section */}
        <section className="relative mt-20">
          <div className="mb-8 flex items-end justify-between px-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Galeri Karyamu</h2>
              <p className="text-slate-500">Kumpulan imajinasi yang telah kamu wujudkan.</p>
            </div>
          </div>

          <div className="rounded-[40px] border border-white/50 bg-white/40 p-6 shadow-inner backdrop-blur-sm">
            <Gallery userImages={userImages} onDeleteImage={handleDeleteImage} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
