import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface ExportOptions {
  title: string;
  imageUrls: string[];
  prompts: string[];
}

const loadImageAsDataURL = async (url: string): Promise<{ dataUrl: string; width: number; height: number }> => {
  const response = await fetch(url, { mode: "cors" });
  const blob = await response.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const dims = await new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = dataUrl;
  });

  return { dataUrl, ...dims };
};

const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  return doc.splitTextToSize(text, maxWidth);
};

export const exportStorybookAsPdf = async ({ title, imageUrls, prompts }: ExportOptions) => {
  if (imageUrls.length === 0) {
    toast.error("Belum ada halaman untuk diekspor");
    return;
  }

  const toastId = toast.loading("Menyiapkan PDF buku ceritamu…");

  try {
    // Landscape A4: 297 x 210 mm — like an open book spread
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Preload all images
    const loaded = await Promise.all(imageUrls.map((u) => loadImageAsDataURL(u)));

    // ---------- COVER PAGE ----------
    // Soft cream background
    doc.setFillColor(250, 246, 238);
    doc.rect(0, 0, pageW, pageH, "F");

    // Cover hero image (first image), centered
    const cover = loaded[0];
    const coverMaxW = pageW * 0.55;
    const coverMaxH = pageH * 0.65;
    const ratio = cover.width / cover.height;
    let cW = coverMaxW;
    let cH = cW / ratio;
    if (cH > coverMaxH) {
      cH = coverMaxH;
      cW = cH * ratio;
    }
    const cX = (pageW - cW) / 2;
    const cY = pageH * 0.12;
    doc.addImage(cover.dataUrl, "JPEG", cX, cY, cW, cH, undefined, "FAST");

    // Title
    doc.setTextColor(40, 35, 30);
    doc.setFont("times", "bold");
    doc.setFontSize(34);
    const titleLines = wrapText(doc, title, pageW - margin * 4);
    const titleY = cY + cH + 18;
    titleLines.forEach((line, i) => {
      doc.text(line, pageW / 2, titleY + i * 12, { align: "center" });
    });

    // Subtitle
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(120, 110, 100);
    doc.text("Sebuah buku cerita bergambar", pageW / 2, titleY + titleLines.length * 12 + 8, {
      align: "center",
    });

    // ---------- SPREAD PAGES ----------
    for (let i = 0; i < imageUrls.length; i++) {
      doc.addPage();

      // Background
      doc.setFillColor(253, 251, 247);
      doc.rect(0, 0, pageW, pageH, "F");

      const halfW = pageW / 2;

      // Center spine line
      doc.setDrawColor(220, 212, 200);
      doc.setLineWidth(0.2);
      doc.line(halfW, margin, halfW, pageH - margin);

      // ---- LEFT PAGE: text ----
      doc.setTextColor(150, 140, 125);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        `HALAMAN ${i + 1} DARI ${imageUrls.length}`,
        margin,
        margin + 4
      );

      doc.setTextColor(45, 40, 35);
      doc.setFont("times", "normal");
      doc.setFontSize(13);
      const textMaxW = halfW - margin * 2;
      const lines = wrapText(doc, prompts[i] ?? "", textMaxW);
      const lineHeight = 7;
      const blockH = lines.length * lineHeight;
      const startY = Math.max(margin + 18, (pageH - blockH) / 2);
      lines.forEach((line, idx) => {
        doc.text(line, margin, startY + idx * lineHeight);
      });

      // Page number bottom
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(160, 150, 135);
      doc.text(`— ${String(i + 1).padStart(2, "0")} —`, margin, pageH - margin);

      // ---- RIGHT PAGE: image (cover-fit) ----
      const img = loaded[i];
      const rightX = halfW + margin;
      const rightY = margin;
      const rightW = halfW - margin * 2;
      const rightH = pageH - margin * 2;

      // Compute cover-fit (crop to fill) by scaling to the larger side
      const imgRatio = img.width / img.height;
      const boxRatio = rightW / rightH;
      let drawW = rightW;
      let drawH = rightH;
      if (imgRatio > boxRatio) {
        // image wider — fit by height, overflow horizontally
        drawH = rightH;
        drawW = drawH * imgRatio;
      } else {
        drawW = rightW;
        drawH = drawW / imgRatio;
      }
      const drawX = rightX - (drawW - rightW) / 2;
      const drawY = rightY - (drawH - rightH) / 2;

      // Clip via rectangle for clean edges (jsPDF doesn't clip easily, so we just place it; A4 margins keep it tidy)
      doc.addImage(img.dataUrl, "JPEG", drawX, drawY, drawW, drawH, undefined, "FAST");
    }

    const safeTitle = title.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "buku-cerita";
    doc.save(`${safeTitle}.pdf`);

    toast.success("PDF berhasil dibuat!", { id: toastId });
  } catch (err) {
    console.error("PDF export failed", err);
    toast.error("Gagal membuat PDF", {
      id: toastId,
      description: err instanceof Error ? err.message : "Silakan coba lagi",
    });
  }
};
