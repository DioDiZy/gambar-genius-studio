
import { supabase } from "@/integrations/supabase/client";

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
}

export async function generateImage(params: GenerateImageParams): Promise<string | null> {
  try {
    // Create the initial generation request
    const { data: initialData, error: initialError } = await supabase.functions.invoke("generate-image", {
      body: {
        prompt: params.prompt,
        aspectRatio: params.aspectRatio || "1:1"
      },
    });

    if (initialError) {
      console.error("Error generating image:", initialError);
      throw initialError;
    }

    // Check if there's a billing error
    if (initialData?.error?.includes("Billing required")) {
      throw new Error("Billing required for Replicate API. Please set up billing on your Replicate account.");
    }

    // Get the image URL from the Replicate response
    const imageUrl = initialData?.output?.[0];
    
    if (!imageUrl) {
      console.error("No image URL returned");
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error("Error in image generation process:", error);
    throw error;
  }
}

// New function to generate multiple images
export async function generateMultipleImages(prompts: string[]): Promise<string[]> {
  if (!prompts.length) return [];

  try {
    const imageUrls: string[] = [];
    
    // Generate images sequentially to avoid overwhelming the API
    for (const prompt of prompts) {
      const imageUrl = await generateImage({ prompt });
      if (imageUrl) {
        imageUrls.push(imageUrl);
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error("Error generating multiple images:", error);
    throw error;
  }
}

export async function saveGeneratedImage(imageUrl: string, prompt: string, userId: string): Promise<{ id: string, image_url: string } | null> {
  try {
    // Don't use useAuth hook here as it's not a React component
    if (!userId) throw new Error("User not authenticated");

    console.log("Starting image save process for:", imageUrl);
    console.log("User ID:", userId);
    
    // First save the image to Supabase Storage using our edge function
    console.log("Saving image to storage with prompt:", prompt);
    const { data: storageData, error: storageError } = await supabase.functions.invoke("save-image-to-storage", {
      body: {
        imageUrl,
        fileName: `image-${Date.now()}`
      },
    });
    
    if (storageError) {
      console.error("Error saving image to storage:", storageError);
      throw storageError;
    }
    
    if (!storageData?.imageUrl) {
      console.error("No storage URL returned");
      throw new Error("Failed to save image to storage");
    }
    
    const permanentImageUrl = storageData.imageUrl;
    console.log("Image saved to storage:", permanentImageUrl);
    
    // Then save the reference in the database
    const { data, error } = await supabase
      .from("images")
      .insert([
        {
          user_id: userId,
          prompt: prompt || "AI generated image",
          image_url: permanentImageUrl // Store the permanent URL from Storage
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error saving image to database:", error);
      throw error;
    }
    
    console.log("Image saved successfully:", data);
    
    // Decrement user credits
    try {
      const { data: creditsData, error: creditsError } = await supabase.rpc('decrement_credits', {
        amount: 1
      });
      
      if (creditsError) {
        console.error("Error decremented credits:", creditsError);
        // Don't throw here, we still saved the image
      } else {
        console.log("Credits decremented. Remaining:", creditsData);
      }
      
      // Increment images generated count
      const { data: countData, error: countError } = await supabase.rpc('increment_count', {
        amount: 1
      });
      
      if (countError) {
        console.error("Error incrementing image count:", countError);
      } else {
        console.log("Images count incremented. New count:", countData);
      }
    } catch (statsError) {
      console.error("Error updating user stats:", statsError);
      // Don't throw, the image was still saved
    }

    return data;
  } catch (error) {
    console.error("Error in saveGeneratedImage function:", error);
    throw error;
  }
}
