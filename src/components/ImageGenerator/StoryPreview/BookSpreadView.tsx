import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface BookSpreadViewProps {
  imageUrls: string[];
  prompts: string[];
  currentIndex: number;
  isGenerating: boolean;
  onSelectImage: (index: number) => void;
}

/**
 * Flipbook-style storyboard: each paragraph = one open-book spread.
 * Left page: the user's story paragraph. Right page: the generated image.
 */
export const BookSpreadView = ({
  imageUrls,
  prompts,
  currentIndex,
  isGenerating,
  onSelectImage,
}: BookSpreadViewProps) => {
  const activeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex]);

  if (isGenerating && imageUrls.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="text-base font-medium text-foreground">
              Sedang menggambar ceritamu…
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Mohon tunggu sebentar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (imageUrls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/30 py-20 px-6 text-center">
        <p className="font-heading text-xl text-foreground mb-2">
          Cerita dan gambar akan muncul di sini
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Tulis ceritamu di sebelah kiri, lalu tekan tombol buat. Setiap paragraf akan menjadi satu halaman di buku ceritamu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {imageUrls.map((url, idx) => {
        const isActive = idx === currentIndex;
        return (
          <article
            key={idx}
            ref={(el) => {
              if (isActive) activeRef.current = el;
            }}
            onClick={() => onSelectImage(idx)}
            className={`
              group cursor-pointer
              transition-all duration-300
              ${isActive ? "" : "opacity-90 hover:opacity-100"}
            `}
          >
            {/* Page label */}
            <div className="flex items-center gap-3 mb-3 px-1">
              <span className="font-heading text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Halaman {idx + 1} dari {imageUrls.length}
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* The spread */}
            <div
              className={`
                relative grid md:grid-cols-2 rounded-2xl overflow-hidden
                bg-card border transition-shadow
                ${isActive
                  ? "border-primary/40 shadow-lg shadow-primary/5"
                  : "border-border/60 shadow-sm group-hover:shadow-md"}
              `}
            >
              {/* Left page — text */}
              <div className="relative p-7 md:p-9 bg-[hsl(var(--background))] flex flex-col justify-center min-h-[280px] md:min-h-[360px]">
                <div className="absolute inset-y-6 right-0 hidden md:block w-px bg-border/60" />
                <div className="absolute inset-y-6 right-px hidden md:block w-px bg-background" />
                <p className="font-heading text-[15px] md:text-[17px] leading-[1.8] text-foreground/90 whitespace-pre-wrap">
                  {prompts[idx]}
                </p>
                <div className="mt-6 text-xs text-muted-foreground/70 font-mono">
                  — {String(idx + 1).padStart(2, "0")} —
                </div>
              </div>

              {/* Right page — image */}
              <div className="relative bg-muted/30 min-h-[280px] md:min-h-[360px]">
                <img
                  src={url}
                  alt={`Ilustrasi halaman ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Connector between pages */}
            {idx < imageUrls.length - 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex items-center gap-2 text-muted-foreground/60">
                  <span className="h-px w-10 bg-border" />
                  <span className="text-[10px] uppercase tracking-widest">Lanjut ke halaman berikutnya</span>
                  <span className="h-px w-10 bg-border" />
                </div>
              </div>
            )}
          </article>
        );
      })}

      {isGenerating && (
        <div className="flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Menambahkan halaman berikutnya…
        </div>
      )}
    </div>
  );
};
