import { supabase } from "@/integrations/supabase/client";
import { CLIPEnhancedService } from "./CLIPEnhancedService";
import { IndonesianNLPService } from "./IndonesianNLPService";

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  language?: "english" | "indonesian";
  style?: string;
}

export async function generateImage(params: GenerateImageParams): Promise<string | null> {
  try {
    let enhancedPrompt = params.prompt;
    
    // Apply Indonesian NLP and CLIP enhancement if Indonesian is selected
    if (params.language === "indonesian") {
      console.log("Applying Indonesian NLP and CLIP enhancement...");
      
      const clipEnhanced = CLIPEnhancedService.enhancePromptWithCLIP(
        params.prompt,
        params.style || 'photorealistic',
        params.language
      );
      
      enhancedPrompt = clipEnhanced.clipOptimizedPrompt;
      
      console.log("Original prompt:", params.prompt);
      console.log("CLIP-enhanced prompt:", enhancedPrompt);
      console.log("Visual keywords:", clipEnhanced.visualKeywords);
      console.log("Semantic context:", clipEnhanced.semanticContext);
      
      // Validate prompt quality
      const validation = CLIPEnhancedService.validatePromptForCLIP(enhancedPrompt);
      console.log("Prompt quality score:", validation.score);
      if (validation.suggestions.length > 0) {
        console.log("Prompt suggestions:", validation.suggestions);
      }
    } else {
      // For English, add basic enhancements
      enhancedPrompt += ". Child-friendly visual representation with appropriate cultural context.";
    }

    // Create the initial generation request
    const { data: initialData, error: initialError } = await supabase.functions.invoke("generate-image", {
      body: {
        prompt: enhancedPrompt,
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

// Function to generate multiple images with improved consistency and Indonesian optimization
export async function generateMultipleImages(
  prompts: string[], 
  language: string = "english",
  style: string = "photorealistic"
): Promise<string[]> {
  if (!prompts.length) return [];

  try {
    const imageUrls: string[] = [];
    
    // Generate a consistent seed for this story generation session
    const sessionSeed = Math.floor(Math.random() * 1000000);
    
    // Process prompts with Indonesian NLP and CLIP enhancement
    const processedPrompts = prompts.map(prompt => {
      if (language === "indonesian") {
        const clipEnhanced = CLIPEnhancedService.enhancePromptWithCLIP(prompt, style, language);
        console.log(`Processed prompt: ${prompt} -> ${clipEnhanced.clipOptimizedPrompt}`);
        return clipEnhanced.clipOptimizedPrompt;
      }
      return prompt;
    });
    
    // Generate images sequentially to avoid overwhelming the API
    for (const processedPrompt of processedPrompts) {
      console.log("Generating image with CLIP-enhanced prompt:", processedPrompt);
      
      const { data: imageData, error: imageError } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: processedPrompt,
          aspectRatio: "1:1",
          seed: sessionSeed, // Use the same seed for all images in this batch
          num_inference_steps: 4, // Keep at max value of 4 as required by the model
        },
      });

      if (imageError) {
        console.error("Error generating image:", imageError);
        continue;
      }

      const imageUrl = imageData?.output?.[0];
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
