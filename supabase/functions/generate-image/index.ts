import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
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
        }
      );
    }

    console.log("Generating image with prompt:", body.prompt);

    try {
      // Define model inputs - ensuring num_inference_steps is always 4 or less
      const modelInputs = {
        prompt: body.prompt,
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: body.aspectRatio || "1:1",
        output_format: "webp",
        output_quality: 80,
        // Limit to 4 steps maximum as required by the model
        num_inference_steps: Math.min(body.num_inference_steps || 3, 4),
      };

      // Add seed parameter if provided for character consistency
      if (body.seed !== undefined) {
        // @ts-ignore - Add seed parameter to modelInputs
        modelInputs.seed = body.seed;
      }

      const output = await replicate.run("black-forest-labs/flux-schnell", {
        input: modelInputs,
      });

      console.log("Generation response:", output);
      return new Response(JSON.stringify({ output }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (apiError) {
      // Check if it's a payment required error
      if (apiError.message && apiError.message.includes("402 Payment Required")) {
        return new Response(
          JSON.stringify({
            error: "Billing required for Replicate API",
            details: "You need to set up billing on your Replicate account to use this feature. Please visit https://replicate.com/account/billing to set up billing.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 402,
          }
        );
      }

      throw apiError;
    }
  } catch (error) {
    console.error("Error in replicate function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
