
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

    console.log("Starting image save process for:", imageUrl);
    console.log("User ID:", user.id);
    
    // Check if the storage bucket exists, if not create it
    const bucketName = "generated_images";
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log("Bucket doesn't exist, creating...");
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (bucketError) {
        console.error("Error creating bucket:", bucketError);
        throw bucketError;
      }
    }

    // Download the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch image, status:", response.status);
      throw new Error("Failed to fetch image");
    }
    
    const imageBlob = await response.blob();
    console.log("Image downloaded, size:", imageBlob.size);

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `generated_${timestamp}.webp`;
    const filePath = `${user.id}/${filename}`;

    console.log("Uploading to storage path:", filePath);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageBlob, {
        contentType: "image/webp",
        cacheControl: "3600"
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    console.log("Upload successful, data:", uploadData);

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log("Public URL generated:", publicUrl);

    // Use the RPC functions to decrease credits and increment image count
    const { data: creditData, error: creditError } = await supabase.rpc('decrement_credits', { amount: 1 });
    if (creditError) {
      console.error("Error decreasing credits:", creditError);
      throw creditError;
    }
    
    const { data: countData, error: countError } = await supabase.rpc('increment_count', { amount: 1 });
    if (countError) {
      console.error("Error incrementing image count:", countError);
      // Continue execution even if this fails
    }
    
    // Save record to the database
    console.log("Saving to database with prompt:", prompt);
    const { data: imageData, error: insertError } = await supabase
      .from("images")
      .insert([
        {
          user_id: user.id,
          prompt: prompt || "AI generated image",
          image_url: publicUrl
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error saving image record:", insertError);
      throw insertError;
    }

    console.log("Database record created:", imageData);

    return imageData;
  } catch (error) {
    console.error("Error saving generated image:", error);
    throw error;
  }
}
