import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { template, characters } = await req.json();

    if (!template) {
      return new Response(JSON.stringify({ error: "template is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build character context if available
    let characterContext = "";
    if (characters && Array.isArray(characters) && characters.length > 0) {
      const charDescriptions = characters.map((c: any) => {
        let desc = `- ${c.name}`;
        if (c.appearance) desc += `: ${c.appearance}`;
        return desc;
      }).join("\n");
      characterContext = `\n\nKarakter yang HARUS digunakan dalam cerita (gunakan nama persis seperti yang diberikan):\n${charDescriptions}\n\nPastikan semua karakter di atas muncul dalam cerita dan berperan aktif.`;
    }

    const templateDescriptions: Record<string, string> = {
      "petualangan-hutan": "Petualangan seru di hutan ajaib yang penuh dengan tumbuhan unik, jembatan tali tua, dan gua tersembunyi",
      "persahabatan": "Kisah persahabatan yang hangat antara anak-anak yang saling membantu menghadapi tantangan",
      "hewan-ajaib": "Cerita tentang hewan-hewan ajaib yang bisa berbicara dan memiliki kekuatan spesial",
      "petualangan-laut": "Petualangan bawah laut yang menakjubkan dengan terumbu karang berwarna-warni dan makhluk laut yang ramah",
      "petualangan-luar-angkasa": "Perjalanan luar angkasa yang mengagumkan ke planet-planet baru dengan pemandangan yang indah",
      "pahlawan-kecil": "Kisah anak-anak biasa yang menjadi pahlawan dengan keberanian dan kebaikan hati mereka",
      "dunia-fantasi": "Petualangan di dunia fantasi dengan kastil, peri, dan makhluk-makhluk mitos yang ramah",
      "misteri-sekolah": "Misteri seru di sekolah yang harus dipecahkan bersama teman-teman",
    };

    const templateDesc = templateDescriptions[template] || template;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Kamu adalah penulis cerita anak-anak Indonesia yang kreatif. Target pembaca: anak usia 10-11 tahun.

Aturan:
1. Tulis cerita dalam Bahasa Indonesia yang sederhana, mudah dipahami anak-anak
2. Cerita harus terdiri dari 3-5 paragraf yang jelas terpisah (gunakan baris kosong antar paragraf)
3. Setiap paragraf harus menggambarkan satu adegan visual yang jelas (cocok untuk dijadikan gambar storyboard)
4. Cerita harus memiliki alur: pembukaan, konflik/tantangan, dan penyelesaian yang positif
5. Gunakan bahasa yang hidup dan deskriptif agar mudah divisualisasikan
6. Hindari kekerasan, hal menyeramkan, atau konten yang tidak sesuai untuk anak-anak
7. Setiap paragraf harus mendeskripsikan setting/lokasi, suasana, dan ekspresi karakter dengan jelas
8. Jangan gunakan kata-kata sulit atau istilah asing
9. HANYA tulis ceritanya saja, tanpa judul, tanpa keterangan, tanpa penjelasan tambahan`
          },
          {
            role: "user",
            content: `Buatkan cerita anak dengan tema: ${templateDesc}${characterContext}\n\nBuat cerita yang menarik dengan 3-5 paragraf, setiap paragraf menggambarkan adegan berbeda yang bisa divisualisasikan.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Terlalu banyak permintaan, coba lagi nanti." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kredit tidak mencukupi." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Gagal membuat cerita" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ story }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-story-template error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
