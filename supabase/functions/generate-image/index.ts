import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
<<<<<<< HEAD
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
=======
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
>>>>>>> 668b6c0fe0d4677d0485750d0b12206cb794176f
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

<<<<<<< HEAD
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

=======
    // Determine which model to use
    const useDevModel = body.model === "flux-dev";
    const modelId = useDevModel 
      ? "black-forest-labs/flux-dev"
      : "black-forest-labs/flux-schnell";

    console.log(`Generating image with model: ${modelId}, prompt:`, body.prompt)
    
    try {
      let modelInputs: Record<string, unknown>;

      if (useDevModel) {
        // Flux.1-dev settings: supports guidance_scale, higher inference steps, negative prompt
        modelInputs = {
          prompt: body.prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: body.aspectRatio || "1:1",
          output_format: "webp",
          output_quality: 80,
          guidance: body.guidance_scale ?? 3.5,
          num_inference_steps: body.num_inference_steps ?? 28,
        };
      } else {
        // Flux-schnell settings: max 4 inference steps
        modelInputs = {
          prompt: body.prompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: body.aspectRatio || "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: Math.min(body.num_inference_steps || 3, 4),
        };
      }
      
>>>>>>> 668b6c0fe0d4677d0485750d0b12206cb794176f
      // Add seed parameter if provided for character consistency
      if (body.seed !== undefined) {
        modelInputs.seed = body.seed;
      }

<<<<<<< HEAD
      const output = await replicate.run("black-forest-labs/flux-schnell", {
        input: modelInputs,
      });
=======
      const output = await replicate.run(modelId, { input: modelInputs });
>>>>>>> 668b6c0fe0d4677d0485750d0b12206cb794176f

      console.log("Generation response:", output);
      return new Response(JSON.stringify({ output }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
<<<<<<< HEAD
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
=======
      })
    } catch (apiError: unknown) {
      const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
      if (errMsg.includes("402 Payment Required")) {
        return new Response(JSON.stringify({ 
          error: "Billing required for Replicate API", 
          details: "You need to set up billing on your Replicate account to use this feature. Please visit https://replicate.com/account/billing to set up billing."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 402,
        })
      }
      throw apiError;
    }
  } catch (error: unknown) {
    console.error("Error in replicate function:", error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
>>>>>>> 668b6c0fe0d4677d0485750d0b12206cb794176f
      status: 500,
    });
  }
});
