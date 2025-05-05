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

export async function saveGeneratedImage(imageUrl: string, prompt: string, userId: string): Promise<{ id: string, image_url: string } | null> {
  try {
    // Removed useAuth hook from here - now accepting userId as a parameter instead
    if (!userId) throw new Error("User not authenticated");

    console.log("Starting image save process for:", imageUrl);
    console.log("User ID:", userId);
    
    // We'll use a direct URL approach instead of storage to simplify
    // This will work with the existing RLS policies
    console.log("Saving image in database with prompt:", prompt);
    
    const { data, error } = await supabase
      .from("images")
      .insert([
        {
          user_id: userId,
          prompt: prompt || "AI generated image",
          image_url: imageUrl // Store the direct URL
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
