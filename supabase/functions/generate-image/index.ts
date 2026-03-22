import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not set");
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const body = await req.json();

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId);
      const prediction = await replicate.predictions.get(body.predictionId);
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If it's a generation request
    if (!body.prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const useDevModel = body.model === "flux-dev";
    const modelId = useDevModel ? "black-forest-labs/flux-dev" : "black-forest-labs/flux-schnell";

    console.log(`Generating image with model: ${modelId}`);

    try {
      let modelInputs: Record<string, unknown>;

      const antiArtifactNegative = "blurry, distorted face, extra limbs, extra fingers, ugly, scary, dark horror style, text, watermark, signature, words, letters, writing, gibberish text, random characters, illegible text, caption, subtitle, label, banner text, logo, stamp, deformed hands, bad anatomy, disfigured, poorly drawn face, mutation, mutated, out of frame, duplicate";

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
          negative_prompt: antiArtifactNegative,
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
          num_inference_steps: Math.min(body.num_inference_steps || 4, 4),
        };
      }

      if (body.seed !== undefined) {
        modelInputs.seed = body.seed;
      }

      const output = await replicate.run(modelId, { input: modelInputs });

      return new Response(JSON.stringify({ output }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (apiError: unknown) {
      const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
      if (errMsg.includes("402 Payment Required")) {
        return new Response(
          JSON.stringify({
            error: "Billing required for Replicate API",
            details: "Please visit https://replicate.com/account/billing to set up billing.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 },
        );
      }
      throw apiError;
    }
  } catch (error: unknown) {
    console.error("Error in generate-image function:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
