import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      return new Response(JSON.stringify({ error: "REPLICATE_API_KEY is not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If polling for an existing prediction
    if (body.predictionId && typeof body.predictionId === "string") {
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${body.predictionId}`,
        { headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` } }
      );
      if (!pollRes.ok) {
        const errText = await pollRes.text();
        console.error("Poll error:", pollRes.status, errText);
        return new Response(JSON.stringify({ error: "Failed to poll prediction", status: "failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const pollData = await pollRes.json();
      return new Response(JSON.stringify({
        status: pollData.status,
        output: pollData.output,
        error: pollData.error,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // New prediction
    if (!body.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return new Response(JSON.stringify({ error: "Missing required field: prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const useDevModel = body.model === "flux-dev";
    const modelVersion = useDevModel
      ? "black-forest-labs/flux-dev"
      : "black-forest-labs/flux-schnell";

    // Build input - flux-dev does NOT support negative_prompt
    const input: Record<string, unknown> = {
      prompt: String(body.prompt),
      go_fast: true,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: body.aspectRatio || "1:1",
      output_format: "webp",
      output_quality: 90,
    };

    if (useDevModel) {
      input.guidance = body.guidance_scale ?? 3.5;
      input.num_inference_steps = body.num_inference_steps ?? 28;
    } else {
      input.num_inference_steps = Math.min(Number(body.num_inference_steps) || 4, 4);
    }

    if (body.seed !== undefined && body.seed !== null) {
      input.seed = body.seed;
    }

    console.log("Creating prediction:", modelVersion, "prompt:", String(body.prompt).substring(0, 100));

    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "respond-async",
      },
      body: JSON.stringify({
        model: modelVersion,
        input,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("Replicate create error:", createRes.status, errText);

      if (createRes.status === 402) {
        return new Response(JSON.stringify({
          error: "Billing required for Replicate API",
          details: "Please visit replicate.com/account/billing to set up billing.",
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (createRes.status === 422) {
        return new Response(JSON.stringify({
          error: "Invalid request to image model",
          details: errText,
        }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to create prediction", details: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prediction = await createRes.json();
    console.log("Prediction created:", prediction.id, "status:", prediction.status);

    // If already completed (fast models)
    if (prediction.status === "succeeded" && prediction.output) {
      return new Response(JSON.stringify({
        output: Array.isArray(prediction.output) ? prediction.output : [prediction.output],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return prediction ID for client-side polling
    return new Response(JSON.stringify({
      predictionId: prediction.id,
      status: prediction.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in generate-image:", errorMessage);

    return new Response(JSON.stringify({ error: "An error occurred", details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
