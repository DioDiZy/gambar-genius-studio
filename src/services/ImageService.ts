import { supabase } from "@/integrations/supabase/client";
import { translateForImageGeneration } from "./TranslationService";

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  language?: "english" | "indonesian";
}

// Poll for prediction result
async function pollPrediction(predictionId: string, maxAttempts = 120): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s between polls

    const { data, error } = await supabase.functions.invoke("generate-image", {
      body: { predictionId },
    });

    if (error) {
      console.error("Polling error:", error);
      throw new Error("Failed to check image status");
    }

    const status = data?.status;
    console.log(`Prediction ${predictionId} status: ${status} (attempt ${i + 1})`);

    if (status === "succeeded") {
      const output = data?.output;
      if (Array.isArray(output) && output.length > 0) {
        return output[0];
      }
      return null;
    }

    if (status === "failed" || status === "canceled") {
      const errMsg = data?.error || "Image generation failed";
      throw new Error(errMsg);
    }
  }

  throw new Error("Image generation timed out");
}

export async function generateImage(params: GenerateImageParams): Promise<string | null> {
  try {
    let enhancedPrompt = await translateForImageGeneration(params.prompt);

    if (params.language === "indonesian") {
      enhancedPrompt += ". Visual representation should match Indonesian cultural context where appropriate.";
    }

    console.log("Image generation prompt:", {
      original: params.prompt,
      enhanced: enhancedPrompt,
      language: params.language,
    });

    // Create the prediction (non-blocking)
    const { data: initialData, error: initialError } = await supabase.functions.invoke("generate-image", {
      body: {
        prompt: enhancedPrompt,
        aspectRatio: params.aspectRatio || "1:1",
      },
    });

    if (initialError) {
      console.error("Error creating prediction:", initialError);
      throw initialError;
    }

    if (initialData?.error?.includes("Billing required")) {
      throw new Error("Billing required for Replicate API. Please set up billing on your Replicate account.");
    }

    // If we got output directly (fast model), return it
    if (initialData?.output?.[0]) {
      return initialData.output[0];
    }

    // Otherwise poll for the result
    const predictionId = initialData?.predictionId;
    if (!predictionId) {
      console.error("No prediction ID or output returned:", initialData);
      return null;
    }

    console.log("Polling for prediction:", predictionId);
    return await pollPrediction(predictionId);
  } catch (error) {
    console.error("Error in image generation process:", error);
    throw error;
  }
}

// Model configuration per style
interface StoryboardModelConfig {
  model?: string;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  negative_prompt?: string;
}

function getModelConfigForStyle(style: string, sessionSeed: number, frameIndex: number): StoryboardModelConfig {
  if (style === "storyboard-sketch") {
    return {
      model: "flux-dev",
      seed: sessionSeed,
      guidance_scale: 3.5,
      num_inference_steps: 28,
    };
  }
  return {
    seed: sessionSeed,
    num_inference_steps: 4,
  };
}

// Function to generate multiple images with storyboard continuity
export async function generateMultipleImages(prompts: string[], style: string = "photorealistic"): Promise<string[]> {
  if (!prompts.length) return [];

  try {
    const imageUrls: string[] = [];
    const sessionSeed = Math.floor(Math.random() * 4294967295);

    const isSketchStyle = style === "storyboard-sketch";
    console.log(`Starting storyboard generation with ${isSketchStyle ? "Flux.1-dev (Storyboard Sketch)" : "Flux-schnell"}`);

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`Generating storyboard frame ${i + 1}/${prompts.length}`);

      const config = getModelConfigForStyle(style, sessionSeed, i);

      try {
        // Create prediction (non-blocking)
        const { data: imageData, error: imageError } = await supabase.functions.invoke("generate-image", {
          body: {
            prompt: prompt,
            aspectRatio: "1:1",
            ...config,
          },
        });

        if (imageError) {
          console.error(`Error creating prediction for frame ${i + 1}:`, imageError);
          // Check if it's an auth or function error vs network error
          const errMsg = typeof imageError === 'object' && imageError.message ? imageError.message : String(imageError);
          console.error(`Frame ${i + 1} error detail:`, errMsg);
          continue;
        }

        // Check for error in response body
        if (imageData?.error) {
          console.error(`Frame ${i + 1} API error:`, imageData.error);
          if (String(imageData.error).includes("Billing required")) {
            throw new Error("Billing required for Replicate API");
          }
          continue;
        }

        // If we got output directly
        if (imageData?.output?.[0]) {
          imageUrls.push(imageData.output[0]);
          console.log(`Frame ${i + 1} generated immediately`);
          continue;
        }

        // Poll for result
        const predictionId = imageData?.predictionId;
        if (!predictionId) {
          console.error(`No prediction ID for frame ${i + 1}, response:`, JSON.stringify(imageData));
          continue;
        }

        const imageUrl = await pollPrediction(predictionId);
        if (imageUrl) {
          imageUrls.push(imageUrl);
          console.log(`Frame ${i + 1} generated via polling`);
        }
      } catch (frameError) {
        console.error(`Error generating frame ${i + 1}:`, frameError);
        // Re-throw billing errors to stop entirely
        if (frameError instanceof Error && frameError.message.includes("Billing required")) {
          throw frameError;
        }
        // Continue to next frame for other errors
      }
    }

    console.log(`Storyboard generation complete: ${imageUrls.length}/${prompts.length} frames`);
    return imageUrls;
  } catch (error) {
    console.error("Error generating storyboard images:", error);
    throw error;
  }
}

export async function saveGeneratedImage(imageUrl: string, prompt: string, userId: string): Promise<{ id: string; image_url: string } | null> {
  try {
    if (!userId) throw new Error("User not authenticated");

    console.log("Starting image save process for:", imageUrl);

    const { data: storageData, error: storageError } = await supabase.functions.invoke("save-image-to-storage", {
      body: {
        imageUrl,
        fileName: `image-${Date.now()}`,
      },
    });

    if (storageError) {
      console.error("Error saving image to storage:", storageError);
      throw storageError;
    }

    if (!storageData?.imageUrl) {
      throw new Error("Failed to save image to storage");
    }

    const permanentImageUrl = storageData.imageUrl;
    console.log("Image saved to storage:", permanentImageUrl);

    const { data, error } = await supabase
      .from("images")
      .insert([
        {
          user_id: userId,
          prompt: prompt || "AI generated image",
          image_url: permanentImageUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving image to database:", error);
      throw error;
    }

    console.log("Image saved successfully:", data);

    try {
      const { error: creditsError } = await supabase.rpc("decrement_credits", { amount: 1 });
      if (creditsError) console.error("Error decrementing credits:", creditsError);

      const { error: countError } = await supabase.rpc("increment_count", { amount: 1 });
      if (countError) console.error("Error incrementing image count:", countError);
    } catch (statsError) {
      console.error("Error updating user stats:", statsError);
    }

    return data;
  } catch (error) {
    console.error("Error in saveGeneratedImage function:", error);
    throw error;
  }
}
