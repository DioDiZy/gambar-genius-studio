import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPLICATE_API_BASE = "https://api.replicate.com/v1";

const antiArtifactPromptInstructions =
  "No text, no watermarks, no letters, no writing, no captions, no logo, no signature, anatomically correct hands, normal fingers, clear face, no duplicate limbs.";

function appendPromptInstructions(prompt: string, instructions: string) {
  const trimmedPrompt = prompt.trim();
  const trimmedInstructions = instructions.trim();
  if (!trimmedPrompt) return trimmedInstructions;
  return trimmedPrompt.endsWith(".")
    ? `${trimmedPrompt} ${trimmedInstructions}`
    : `${trimmedPrompt}. ${trimmedInstructions}`;
}

async function replicateRequest(path: string, apiKey: string, method = "GET", body?: unknown) {
  const opts: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${REPLICATE_API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Replicate API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await anonClient.auth.getUser();
    if (userError || !userData?.user) {
      console.error("Auth failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY is not set");
    }

    const body = await req.json();
    console.log("Request body keys:", Object.keys(body));

    // Polling: check prediction status
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId);
      const prediction = await replicateRequest(`/predictions/${body.predictionId}`, REPLICATE_API_KEY);
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generation request
    if (!body.prompt) {
      return new Response(JSON.stringify({ error: "Missing required field: prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const useDevModel = body.model === "flux-dev";
    const modelVersion = useDevModel
      ? "black-forest-labs/flux-dev"
      : "black-forest-labs/flux-schnell";

    console.log(`Creating prediction with model: ${modelVersion}`);

    let modelInputs: Record<string, unknown>;
    if (useDevModel) {
      modelInputs = {
        prompt: appendPromptInstructions(body.prompt, antiArtifactPromptInstructions),
        go_fast: true,
        megapixels: "1",
        num_outputs: 1,
        aspect_ratio: body.aspectRatio || "1:1",
        output_format: "webp",
        output_quality: 90,
        guidance: body.guidance_scale ?? 3.5,
        num_inference_steps: body.num_inference_steps ?? 28,
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

    console.log("Model inputs:", JSON.stringify(modelInputs).substring(0, 200));

    try {
      const prediction = await replicateRequest("/models/" + modelVersion + "/predictions", REPLICATE_API_KEY, "POST", { input: modelInputs });

      console.log("Prediction created:", prediction.id, "status:", prediction.status);

      return new Response(JSON.stringify({
        predictionId: prediction.id,
        status: prediction.status,
        output: prediction.output,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (apiError: unknown) {
      const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
      console.error("Replicate API error:", errMsg);

      if (errMsg.includes("402") || errMsg.includes("Payment Required")) {
        return new Response(JSON.stringify({
          error: "Billing required for Replicate API",
          details: "Please visit https://replicate.com/account/billing to set up billing.",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402,
        });
      }

      if (errMsg.includes("422")) {
        return new Response(JSON.stringify({ error: "Invalid image generation request", details: errMsg }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422,
        });
      }

      throw apiError;
    }
  } catch (error: unknown) {
    console.error("Error in generate-image function:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "An error occurred",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
