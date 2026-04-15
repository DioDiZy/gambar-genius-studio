import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    // 1) Ambil bearer token dari request
    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");

    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      return jsonResponse({ error: "Unauthorized: missing bearer token" }, 401);
    }

    // 2) Validasi token user ke Supabase Auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Invalid user token:", userError);
      return jsonResponse(
        {
          error: "Unauthorized: invalid user token",
          details: userError?.message ?? null,
        },
        401,
      );
    }

    // 3) Ambil body request
    const body = await req.json().catch(() => ({}) as any);
    const template = typeof body?.template === "string" ? body.template : "";
    const characters = Array.isArray(body?.characters) ? body.characters : [];

    if (!template || template.length > 200) {
      return jsonResponse({ error: "Valid template is required" }, 400);
    }

    // 4) Susun konteks karakter
    let characterContext = "";
    if (characters.length > 0 && characters.length <= 20) {
      const charDescriptions = characters
        .slice(0, 20)
        .map((raw: any) => {
          const c = raw && typeof raw === "object" ? raw : {};
          const name = String(c.name ?? "").slice(0, 100);
          const appearance = String(c.appearance ?? "").slice(0, 500);

          let desc = `- ${name || "Karakter"}`;
          if (appearance) desc += `: ${appearance}`;
          return desc;
        })
        .join("\n");

      characterContext = `\n\nKarakter yang HARUS digunakan dalam cerita (gunakan nama persis seperti yang diberikan):\n` + `${charDescriptions}\n\n` + `Pastikan semua karakter di atas muncul dalam cerita dan berperan aktif.`;
    }

    // 5) Template mapping
    const templateDescriptions: Record<string, string> = {
      "petualangan-hutan": "Petualangan seru di hutan ajaib yang penuh dengan tumbuhan unik, jembatan tali tua, dan gua tersembunyi",
      persahabatan: "Kisah persahabatan yang hangat antara anak-anak yang saling membantu menghadapi tantangan",
      "hewan-ajaib": "Cerita tentang hewan-hewan ajaib yang bisa berbicara dan memiliki kekuatan spesial",
      "petualangan-laut": "Petualangan bawah laut yang menakjubkan dengan terumbu karang berwarna-warni dan makhluk laut yang ramah",
      "petualangan-luar-angkasa": "Perjalanan luar angkasa yang mengagumkan ke planet-planet baru dengan pemandangan yang indah",
      "pahlawan-kecil": "Kisah anak-anak biasa yang menjadi pahlawan dengan keberanian dan kebaikan hati mereka",
      "dunia-fantasi": "Petualangan di dunia fantasi dengan kastil, peri, dan makhluk-makhluk mitos yang ramah",
      "misteri-sekolah": "Misteri seru di sekolah yang harus dipecahkan bersama teman-teman",
    };

    const templateDesc = templateDescriptions[template] || template;

    // 6) Ambil API key provider
    const SUMOPOD_API_KEY = Deno.env.get("SUMOPOD_API_KEY");
    if (!SUMOPOD_API_KEY) {
      return jsonResponse({ error: "SUMOPOD_API_KEY is not configured" }, 500);
    }

    // 7) Call provider AI
    // Ganti model jika akun Sumopod kamu memakai slug model lain.
    const providerResponse = await fetch("https://ai.sumopod.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUMOPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Kamu adalah penulis cerita anak-anak Indonesia yang kreatif. Target pembaca: anak usia 10-11 tahun.

Kamu harus mengembalikan output dalam format JSON yang valid (tanpa markdown code block) dengan struktur berikut:
{
  "story": "cerita lengkap dengan paragraf dipisahkan baris kosong",
  "characters": [
    {
      "name": "Nama Karakter",
      "appearance": "Deskripsi fisik detail: gender, usia perkiraan, warna rambut, gaya rambut, warna kulit, pakaian yang dikenakan, ciri khas fisik"
    }
  ],
  "additionalInstructions": "instruksi tambahan untuk konsistensi visual gambar: setting lokasi, suasana, gaya ilustrasi, pencahayaan, palet warna"
}

Aturan untuk cerita:
1. Tulis cerita dalam Bahasa Indonesia yang sederhana, mudah dipahami anak-anak
2. Cerita harus terdiri dari 3-5 paragraf yang jelas terpisah (gunakan baris kosong antar paragraf)
3. Setiap paragraf harus menggambarkan satu adegan visual yang jelas
4. Cerita harus memiliki alur: pembukaan, konflik/tantangan, dan penyelesaian yang positif
5. Gunakan bahasa yang hidup dan deskriptif
6. Hindari kekerasan, hal menyeramkan, atau konten yang tidak sesuai untuk anak-anak
7. Setiap paragraf harus mendeskripsikan setting/lokasi, suasana, dan ekspresi karakter dengan jelas
8. Jangan gunakan kata-kata sulit atau istilah asing

Aturan untuk characters:
1. Daftarkan SEMUA karakter yang muncul dalam cerita
2. Beri deskripsi fisik yang sangat detail dan spesifik untuk setiap karakter
3. Jika karakter sudah diberikan oleh pengguna, gunakan deskripsi mereka dan tambahkan detail jika perlu

Aturan untuk additionalInstructions:
1. Tuliskan instruksi visual yang konsisten untuk semua gambar
2. Termasuk setting lokasi utama, suasana, waktu hari, gaya ilustrasi
3. Tuliskan dalam bahasa Indonesia`,
          },
          {
            role: "user",
            content:
              `Buatkan cerita anak dengan tema: ${templateDesc}${characterContext}\n\n` +
              `Buat cerita yang menarik dengan 3-5 paragraf, setiap paragraf menggambarkan adegan berbeda yang bisa divisualisasikan. ` +
              `Kembalikan dalam format JSON sesuai instruksi.`,
          },
        ],
      }),
    });

    const providerText = await providerResponse.text();

    if (!providerResponse.ok) {
      console.error("Sumopod error:", providerResponse.status, providerText);

      return jsonResponse(
        {
          error: "AI provider request failed",
          providerStatus: providerResponse.status,
          providerBody: providerText,
        },
        502,
      );
    }

    let providerData: any;
    try {
      providerData = JSON.parse(providerText);
    } catch (_err) {
      console.error("Provider returned non-JSON:", providerText);
      return jsonResponse(
        {
          error: "Provider returned non-JSON response",
          providerBody: providerText,
        },
        502,
      );
    }

    const rawContent = typeof providerData?.choices?.[0]?.message?.content === "string" ? providerData.choices[0].message.content : "";

    if (!rawContent) {
      return jsonResponse(
        {
          error: "Provider returned empty content",
          providerBody: providerData,
        },
        502,
      );
    }

    // 8) Parse output model
    let story = "";
    let generatedCharacters: any[] = [];
    let additionalInstructions = "";

    try {
      const cleaned = rawContent
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      story = typeof parsed.story === "string" ? parsed.story : "";
      generatedCharacters = Array.isArray(parsed.characters) ? parsed.characters : [];
      additionalInstructions = typeof parsed.additionalInstructions === "string" ? parsed.additionalInstructions : "";

      if (!story) {
        story = cleaned;
      }
    } catch (_err) {
      // Fallback kalau model tidak balas JSON valid
      story = rawContent;
    }

    return jsonResponse({
      story,
      characters: generatedCharacters,
      additionalInstructions,
    });
  } catch (error) {
    console.error("generate-story-template error:", error);

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500,
    );
  }
});
