import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenReaderProps {
  open: boolean;
  onClose: () => void;
  title: string;
  imageUrls: string[];
  prompts: string[];
}

/**
 * Distraction-free, fullscreen storybook reader.
 * Page 0 = cover. Pages 1..N = spreads (text left, image right).
 */
export const FullscreenReader = ({
  open,
  onClose,
  title,
  imageUrls,
  prompts,
}: FullscreenReaderProps) => {
  // 0 = cover; 1..imageUrls.length = spreads
  const totalPages = imageUrls.length + 1;
  const [page, setPage] = useState(0);

  const goNext = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  useEffect(() => {
    if (!open) setPage(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, goNext, goPrev, onClose]);

  if (!open) return null;

  const isCover = page === 0;
  const spreadIdx = page - 1;

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(var(--background))] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <p className="font-heading text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Mode Baca
        </p>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {isCover
            ? "Sampul"
            : `Halaman ${spreadIdx + 1} dari ${imageUrls.length}`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="rounded-lg"
          aria-label="Tutup mode baca"
        >
          <X className="h-4 w-4 mr-1.5" />
          Tutup
        </Button>
      </div>

      {/* Page area */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-6 overflow-hidden">
        {isCover ? (
          // ----- COVER -----
          <div className="w-full max-w-3xl flex flex-col items-center text-center">
            {imageUrls[0] && (
              <div className="w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden shadow-2xl shadow-primary/10 mb-8 bg-muted">
                <img
                  src={imageUrls[0]}
                  alt="Sampul buku cerita"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="font-heading text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
              Sebuah buku cerita
            </p>
            <h1 className="font-heading text-3xl md:text-5xl text-foreground leading-tight max-w-2xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-6 italic">
              Tekan panah kanan untuk mulai membaca
            </p>
          </div>
        ) : (
          // ----- SPREAD -----
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border/60 shadow-2xl bg-card max-h-full">
            {/* Left: text */}
            <div className="relative p-8 md:p-12 bg-[hsl(var(--background))] flex flex-col justify-center min-h-[60vh] md:min-h-[70vh] overflow-y-auto">
              <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
                Halaman {spreadIdx + 1}
              </p>
              <p className="font-heading text-lg md:text-xl leading-[1.9] text-foreground/90 whitespace-pre-wrap">
                {prompts[spreadIdx]}
              </p>
              <div className="mt-8 text-xs text-muted-foreground/70 font-mono">
                — {String(spreadIdx + 1).padStart(2, "0")} —
              </div>
            </div>

            {/* Right: image */}
            <div className="relative bg-muted/40 min-h-[60vh] md:min-h-[70vh]">
              <img
                src={imageUrls[spreadIdx]}
                alt={`Ilustrasi halaman ${spreadIdx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={page === 0}
          className="rounded-lg"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Sebelumnya
        </Button>

        {/* Page dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={i === 0 ? "Sampul" : `Halaman ${i}`}
              className={`h-1.5 rounded-full transition-all ${
                i === page
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={page === totalPages - 1}
          className="rounded-lg"
        >
          Berikutnya
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
