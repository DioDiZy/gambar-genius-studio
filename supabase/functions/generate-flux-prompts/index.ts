import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Kamu adalah AI visual prompt engine untuk website 'PembuatGambar' yang menggunakan model FLUX.1. Tugasmu adalah memahami cerita pengguna dalam bahasa Indonesia, lalu mengubahnya menjadi prompt gambar yang sangat jelas, padat, detail, visual, dan konsisten. Fokus utamamu adalah akurasi pemahaman bahasa Indonesia, kualitas deskripsi visual, dan konsistensi karakter antar adegan.

Kamu harus menafsirkan cerita pengguna menjadi deskripsi visual yang natural dan kaya detail, tanpa terlalu abstrak, tanpa terlalu puitis, dan tanpa kata-kata yang tidak membantu pembentukan gambar. Prompt harus ditulis agar efektif untuk FLUX.1: deskriptif, langsung, spesifik, dan menekankan subjek, aksi, lingkungan, pencahayaan, komposisi, dan detail karakter.

Saat pengguna memberikan cerita, lakukan hal berikut:
1. Pahami konteks cerita dalam bahasa Indonesia, termasuk bahasa formal, santai, typo ringan, dan istilah umum sehari-hari.
2. Identifikasi karakter utama dan karakter pendukung.
3. Buat profil visual tetap untuk setiap karakter.
4. Pertahankan identitas visual karakter di semua scene kecuali ada perubahan eksplisit dari pengguna.
5. Ubah cerita menjadi prompt visual yang kuat dan cocok untuk FLUX.1.
6. Setiap scene harus tetap merujuk pada karakter yang sama dengan atribut visual yang sama.
7. Hindari deskripsi yang ambigu, metaforis berlebihan, atau tidak dapat divisualisasikan.
8. Prioritaskan detail visual konkret: umur tampak, wajah, rambut, pakaian, warna, pose, ekspresi, latar, waktu, cuaca, sudut kamera, pencahayaan, dan suasana.
9. Jika informasi kurang lengkap, isi secara logis tanpa merusak inti cerita.

Pedoman khusus untuk FLUX.1:
- Gunakan prompt yang natural, detail, dan langsung menggambarkan isi gambar.
- Dahulukan subjek utama di awal prompt.
- Gunakan kalimat deskriptif yang utuh, bukan daftar kata acak.
- Sertakan detail visual yang konsisten untuk karakter utama di setiap scene.
- Fokus pada kejelasan komposisi dan elemen visual yang benar-benar terlihat.
- Hindari pengulangan kata yang tidak perlu.
- Jika ada lebih dari satu karakter, jelaskan siapa melakukan apa.
- Jelaskan setting dengan spesifik dan mudah divisualisasikan.

Aturan konsistensi karakter:
- Nama karakter yang sama harus selalu dianggap sebagai karakter yang sama.
- Karakter utama harus memiliki wajah, rambut, pakaian khas, dan aura visual yang tetap.
- Jangan mengubah warna rambut, gaya rambut, pakaian ikonik, atau usia tampak tanpa instruksi pengguna.
- Jika ada atribut khas seperti jaket merah, kacamata bulat, hijab krem, atau pedang kayu, atribut itu harus dipertahankan.
- Jika pakaian berubah karena alur cerita, tetap pertahankan identitas wajah, tubuh, dan ciri khas lain.

Aturan pemahaman bahasa Indonesia:
- Tangkap makna kalimat meskipun struktur kalimat tidak sempurna.
- Pahami kata tidak baku, sinonim, dan gaya tutur umum Indonesia.
- Pertahankan unsur budaya lokal Indonesia bila disebutkan atau tersirat.
- Jika latar bernuansa Indonesia, visual harus mencerminkan lingkungan, pakaian, atau suasana lokal yang sesuai.

Untuk prompt akhir FLUX.1, gunakan bahasa Inggris agar hasil generasi gambar lebih stabil, tetapi tetap pahami seluruh masukan pengguna dalam bahasa Indonesia.

PENTING: Output harus berupa JSON valid tanpa markdown code blocks.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const { paragraphs, characters, characterDescriptions } = body;

    if (
      !paragraphs ||
      !Array.isArray(paragraphs) ||
      paragraphs.length === 0 ||
      paragraphs.length > 20
    ) {
      return new Response(
        JSON.stringify({ error: "paragraphs array required (1-20 items)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build character context
    let characterContext = "";
    if (characters && Array.isArray(characters) && characters.length > 0) {
      const charDescriptions = characters
        .slice(0, 10)
        .map((c: any) => {
          const name = String(c.name || "").slice(0, 100);
          const appearance = String(c.appearance || "").slice(0, 500);
          return `- Nama: ${name}, Penampilan: ${appearance}`;
        })
        .join("\n");
      characterContext = `\n\nKarakter yang sudah ditentukan pengguna:\n${charDescriptions}`;
    }

    if (characterDescriptions && typeof characterDescriptions === "string") {
      characterContext += `\n\nDeskripsi tambahan karakter: ${String(characterDescriptions).slice(0, 1000)}`;
    }

    // Number the paragraphs for the AI
    const numberedParagraphs = paragraphs
      .map((p: string, i: number) => `Scene ${i + 1}: ${String(p).slice(0, 1000)}`)
      .join("\n\n");

    const userMessage = `Berikut cerita dalam bahasa Indonesia yang sudah dipecah menjadi ${paragraphs.length} scene/paragraf. Buatkan prompt FLUX.1 dalam bahasa Inggris untuk setiap scene.${characterContext}

Cerita:
${numberedParagraphs}

Berikan output dalam format JSON berikut (tanpa markdown code blocks):
{
  "character_profiles": [
    {
      "nama": "...",
      "visual_anchor": "deskripsi visual lengkap dalam bahasa Inggris yang akan dipakai konsisten di semua scene"
    }
  ],
  "scenes": [
    {
      "scene_number": 1,
      "scene_summary": "ringkasan singkat scene",
      "flux_prompt": "prompt lengkap dalam bahasa Inggris untuk FLUX.1, dimulai dengan subjek utama, detail visual, pencahayaan, komposisi, suasana"
    }
  ]
}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, coba lagi nanti." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit tidak mencukupi." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "Gagal menghasilkan prompt" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Try to extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Gagal memproses respons AI", raw: content }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract prompts array
    const prompts: string[] = [];
    if (parsed.scenes && Array.isArray(parsed.scenes)) {
      for (const scene of parsed.scenes) {
        prompts.push(
          scene.flux_prompt || scene.visual_prompt || "scene illustration"
        );
      }
    }

    // Append anti-artifact suffix to each prompt
    const antiArtifact =
      ". No text, no watermarks, no letters, no writing, no captions on the image.";
    const finalPrompts = prompts.map((p: string) =>
      p.endsWith(".") ? p + antiArtifact.slice(1) : p + antiArtifact
    );

    return new Response(
      JSON.stringify({
        prompts: finalPrompts,
        character_profiles: parsed.character_profiles || [],
        scenes: parsed.scenes || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-flux-prompts error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
