import { useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";

interface StoryTextAreaProps {
  story: string;
  onStoryChange: (value: string) => void;
  paragraphCount: number;
  isGenerating: boolean;
  language?: string;
  /** Positions [start, end] of badwords to highlight */
  badwordPositions?: Array<[number, number]>;
}

export const StoryTextArea = ({ story, onStoryChange, paragraphCount, isGenerating, badwordPositions = [] }: StoryTextAreaProps) => {
  const placeholder =
    "Pada suatu hari di sebuah desa kecil, hiduplah seorang anak yang sangat suka bertualang...\n\nSuatu pagi, ia berjalan masuk ke dalam hutan dan menemukan pondok tua yang sudah lama ditinggalkan. Sinar matahari menembus celah-celah atap jerami.";

  const charCount = story.length;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  /** Build highlighted HTML from story text and badword positions */
  const buildHighlightMarkup = () => {
    if (badwordPositions.length === 0 || !story) return null;
    const sorted = [...badwordPositions].sort((a, b) => a[0] - b[0]);
    const parts: string[] = [];
    let cursor = 0;
    for (const [start, end] of sorted) {
      if (start > cursor) {
        parts.push(escapeHtml(story.slice(cursor, start)));
      }
      parts.push(`<mark class="bg-destructive/25 text-transparent rounded-sm">${escapeHtml(story.slice(start, end))}</mark>`);
      cursor = end;
    }
    if (cursor < story.length) {
      parts.push(escapeHtml(story.slice(cursor)));
    }
    // Add trailing newline so backdrop sizing matches textarea
    return parts.join("") + "\n";
  };

  const highlightMarkup = buildHighlightMarkup();

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">Ceritamu</label>
        <span className="text-xs text-muted-foreground tabular-nums">{paragraphCount > 0 ? `${paragraphCount} ${paragraphCount === 1 ? "halaman" : "halaman"} · ${charCount} karakter` : `${charCount} karakter`}</span>
      </div>

      <div className="relative">
        {/* Highlight backdrop */}
        {highlightMarkup && (
          <div
            ref={backdropRef}
            aria-hidden
            className="absolute inset-0 min-h-[320px] text-[15px] leading-[1.7] font-heading rounded-xl p-5 overflow-hidden whitespace-pre-wrap break-words text-transparent pointer-events-none z-0"
            dangerouslySetInnerHTML={{ __html: highlightMarkup }}
          />
        )}
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={story}
          onChange={(e) => onStoryChange(e.target.value)}
          onScroll={handleScroll}
          className={`min-h-[320px] text-[15px] leading-[1.7] font-heading rounded-xl border border-input focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 p-5 resize-y placeholder:text-muted-foreground/50 relative z-[1] ${highlightMarkup ? "bg-transparent" : "bg-card"}`}
          disabled={isGenerating}
        />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">Tips: pisahkan setiap paragraf dengan baris kosong. Setiap paragraf akan menjadi satu halaman bergambar.</p>
    </div>
  );
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
