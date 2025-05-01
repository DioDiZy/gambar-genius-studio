
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GenerateImageParams {
  prompt: string;
  style?: string;
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

export async function saveGeneratedImage(imageUrl: string, prompt: string): Promise<{ id: string, image_url: string } | null> {
  try {
    const { user } = useAuth();
    if (!user) throw new Error("User not authenticated");

    // Download the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch image");
    const imageBlob = await response.blob();

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `generated_${timestamp}.webp`;
    const filePath = `${user.id}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("generated_images")
      .upload(filePath, imageBlob, {
        contentType: "image/webp"
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("generated_images")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Save record to the database
    const { data: imageData, error: insertError } = await supabase
      .from("images")
      .insert([
        {
          user_id: user.id,
          prompt: prompt,
          image_url: publicUrl
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error saving image record:", insertError);
      throw insertError;
    }

    // Update user's images_generated count - Fixed TypeScript error by retrieving profile data first
    // Instead of accessing user.images_generated directly, get the profile data from the database
    const { data: profileData } = await supabase
      .from("profiles")
      .select("images_generated")
      .eq("id", user.id)
      .single();
    
    // Update the profile with incremented count
    await supabase
      .from("profiles")
      .update({ 
        images_generated: profileData?.images_generated ? profileData.images_generated + 1 : 1 
      })
      .eq("id", user.id);

    return imageData;
  } catch (error) {
    console.error("Error saving generated image:", error);
    throw error;
  }
}
