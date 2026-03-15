import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
      console.log("Status check response:", prediction);
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If it's a generation request
    if (!body.prompt) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: prompt is required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Determine which model to use
    const useDevModel = body.model === "flux-dev";
    const modelId = useDevModel ? "black-forest-labs/flux-dev" : "black-forest-labs/flux-schnell";

    console.log(`Generating image with model: ${modelId}, prompt:`, body.prompt);

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

      // Add seed parameter if provided for character consistency
      if (body.seed !== undefined) {
        modelInputs.seed = body.seed;
      }

      const output = await replicate.run(modelId, { input: modelInputs });

      console.log("Generation response:", output);
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
            details: "You need to set up billing on your Replicate account to use this feature. Please visit https://replicate.com/account/billing to set up billing.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 402,
          },
        );
      }
      throw apiError;
    }
  } catch (error: unknown) {
    console.error("Error in replicate function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
