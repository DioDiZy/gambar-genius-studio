import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

    if (!REPLICATE_API_KEY) {
      return new Response(JSON.stringify({ error: "REPLICATE_API_KEY is not set" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (!body.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return new Response(JSON.stringify({ error: "Missing required field: prompt is required" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const useDevModel = body.model === "flux-dev";
    const modelId = useDevModel ? "black-forest-labs/flux-dev" : "black-forest-labs/flux-schnell";

    const antiArtifactNegative =
      "blurry, distorted face, extra limbs, extra fingers, ugly, scary, dark horror style, text, watermark, signature, words, letters, writing, gibberish text, random characters, illegible text, caption, subtitle, label, banner text, logo, stamp, deformed hands, bad anatomy, disfigured, poorly drawn face, mutation, mutated, out of frame, duplicate";

    let modelInputs: Record<string, unknown>;

    if (useDevModel) {
      modelInputs = {
        prompt: body.prompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: body.aspectRatio || "1:1",
        output_format: "webp",
        output_quality: 90,
        guidance: body.guidance_scale ?? 3.5,
        num_inference_steps: body.num_inference_steps ?? 28,
        negative_prompt: body.negative_prompt || antiArtifactNegative,
      };
    } else {
      modelInputs = {
        prompt: body.prompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: body.aspectRatio || "1:1",
        output_format: "webp",
        output_quality: 90,
        num_inference_steps: Math.min(Number(body.num_inference_steps) || 4, 4),
      };
    }

    if (body.seed !== undefined && body.seed !== null) {
      modelInputs.seed = body.seed;
    }

    console.log("Generating image with model:", modelId);
    console.log("Prompt:", body.prompt);

    const output = await replicate.run(modelId, {
      input: modelInputs,
    });

    return new Response(JSON.stringify({ output }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("Error in generate-image function:", errorMessage);

    if (errorMessage.includes("402 Payment Required")) {
      return new Response(
        JSON.stringify({
          error: "Billing required for Replicate API",
          details: "Please visit replicate.com/account/billing to set up billing.",
        }),
        {
          status: 402,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
