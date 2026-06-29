
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

  // Run download work inside a blank popup so the current page never refreshes.
  // The popup auto-closes after the download(s) are triggered.
  const runInBlankTab = async (
    label: string,
    work: (popup: Window) => Promise<void> | void
  ) => {
    const popup = window.open("", "_blank");
    if (!popup) {
      toast.error("Popup diblokir", {
        description: "Izinkan popup di browser untuk mengunduh di tab baru.",
      });
      return;
    }
    try {
      popup.document.write(`
        <!doctype html><html><head><meta charset="utf-8"><title>${label}</title>
        <style>
          body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;
               height:100vh;margin:0;background:#faf6ee;color:#2a2520;text-align:center;padding:24px}
          .box{max-width:360px}
          .spinner{width:36px;height:36px;border:3px solid #e5dccb;border-top-color:#8b5cf6;
                   border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px}
          @keyframes spin{to{transform:rotate(360deg)}}
        </style></head>
        <body><div class="box"><div class="spinner"></div>
        <h3 style="margin:0 0 6px">${label}</h3>
        <p style="margin:0;color:#7a6f60;font-size:14px">Tab ini akan tertutup otomatis…</p>
        </div></body></html>
      `);
      popup.document.close();
      await work(popup);
    } catch (e) {
      console.error("Download tab error:", e);
    } finally {
      // small delay so the browser registers the download(s) before close
      setTimeout(() => {
        try { popup.close(); } catch { /* ignore */ }
      }, 1200);
    }
  };

  const triggerDownload = (doc: Document, url: string, filename: string) => {
    const link = doc.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
  };

  const handleDownload = (imageUrl: string) => {
    const filename = `story-image-${currentIndex + 1}.webp`;
    runInBlankTab("Mengunduh halaman…", (popup) => {
      triggerDownload(popup.document, imageUrl, filename);
      toast.success("Halaman diunduh");
    });
  };

  const handleDownloadAll = (imageUrls: string[]) => {
    runInBlankTab("Mengunduh semua halaman…", async (popup) => {
      for (let i = 0; i < imageUrls.length; i++) {
        triggerDownload(popup.document, imageUrls[i], `story-image-${i + 1}.webp`);
        // stagger so browsers don't drop concurrent downloads
        await new Promise((r) => setTimeout(r, 250));
      }
      toast.success(`${imageUrls.length} halaman diunduh`);
    });
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
