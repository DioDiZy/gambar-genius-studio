
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { saveGeneratedImage, saveStorybook } from "@/services/ImageService";

interface UseStoryImagesProps {
  onSaved: () => void;
}

export const useStoryImages = ({ onSaved }: UseStoryImagesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'storyboard'>('storyboard');
  const { user } = useAuth();

  // Open the gallery in a NEW TAB so the current story state stays intact
  const openGalleryInNewTab = () => {
    try {
      window.open(`${window.location.origin}/dashboard#galeri`, "_blank", "noopener,noreferrer");
    } catch {
      /* popup blocked - ignore */
    }
  };

  const handleSave = async (imageUrl: string, prompt: string) => {
    if (!imageUrl || !prompt) {
      toast.error("Data tidak lengkap", { description: "Gambar dan prompt diperlukan" });
      return;
    }

    if (!user) {
      toast.error("Login dulu ya", { description: "Kamu harus masuk untuk menyimpan gambar" });
      return;
    }
    
    try {
      setSaving(true);
      toast.info("Menyimpan halaman ke galeri…");
      await saveGeneratedImage(imageUrl, prompt, user.id);
      onSaved();
      toast.success("Halaman tersimpan di galeri!", {
        action: { label: "Buka galeri", onClick: openGalleryInNewTab },
      });
      openGalleryInNewTab();
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Gagal menyimpan gambar", {
        description: error instanceof Error ? error.message : "Coba lagi ya",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBook = async (
    title: string,
    imageUrls: string[],
    prompts: string[]
  ) => {
    if (!user) {
      toast.error("Login dulu ya", { description: "Kamu harus masuk untuk menyimpan buku" });
      return;
    }
    if (!imageUrls.length) {
      toast.error("Belum ada halaman", { description: "Buat ceritamu dulu sebelum menyimpan" });
      return;
    }
    try {
      setSavingBook(true);
      toast.info(`Menyimpan buku "${title}" (${imageUrls.length} halaman)…`);
      await saveStorybook({ title, imageUrls, prompts, userId: user.id });
      onSaved();
      toast.success("Buku tersimpan di galeri!", {
        action: { label: "Buka galeri", onClick: openGalleryInNewTab },
      });
      openGalleryInNewTab();
    } catch (error) {
      console.error("Error saving storybook:", error);
      toast.error("Gagal menyimpan buku", {
        description: error instanceof Error ? error.message : "Coba lagi ya",
      });
    } finally {
      setSavingBook(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `story-image-${currentIndex + 1}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = (imageUrls: string[]) => {
    imageUrls.forEach((url, index) => {
      const link = document.createElement("a");
      link.href = url;
      link.download = `story-image-${index + 1}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    toast.success(`Downloaded ${imageUrls.length} images`);
  };

  const handleNext = (length: number) => {
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const handlePrevious = (length: number) => {
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  const handleSelectImage = (index: number) => {
    setCurrentIndex(index);
  };

  return {
    currentIndex,
    setCurrentIndex,
    saving,
    savingBook,
    viewMode,
    setViewMode,
    handleSave,
    handleSaveBook,
    handleDownload,
    handleDownloadAll,
    handleNext,
    handlePrevious,
    handleSelectImage
  };
};
