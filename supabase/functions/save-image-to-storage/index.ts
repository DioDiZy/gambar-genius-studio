
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl, fileName } = await req.json()
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    console.log("Downloading image from:", imageUrl)
    
    // Download the image from the external URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }
    
    const imageBlob = await imageResponse.blob()
    const uniqueFileName = `${fileName || 'image'}-${Date.now()}.webp`
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Create the images bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket('images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })
      .catch(e => ({ data: null, error: e }))
      
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error("Error creating bucket:", bucketError)
      throw bucketError
    }
    
    // Upload the blob to Supabase Storage
    console.log("Uploading to Supabase Storage with filename:", uniqueFileName)
    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(uniqueFileName, imageBlob, {
        contentType: 'image/webp',
        upsert: true,
      })
      
    if (error) {
      console.error("Error uploading image:", error)
      throw error
    }
    
    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(data.path)
      
    console.log("Image successfully stored at:", publicUrl)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: publicUrl
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error("Error in save-image-to-storage function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
