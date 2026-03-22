import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const ALLOWED_ORIGINS = [
  'https://replicate.delivery',
  'https://pbxt.replicate.delivery',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub;

    const { imageUrl, fileName } = await req.json()
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    // Validate URL against allowlist to prevent SSRF
    let parsed: URL;
    try {
      parsed = new URL(imageUrl);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    if (parsed.protocol !== 'https:') {
      return new Response(JSON.stringify({ error: "Only HTTPS URLs are allowed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 });
    }
    if (!ALLOWED_ORIGINS.some(o => parsed.origin === o)) {
      return new Response(JSON.stringify({ error: "Image origin not allowed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 });
    }

    console.log("Downloading image from:", imageUrl)
    
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }

    // Validate content type
    const contentType = imageResponse.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return new Response(JSON.stringify({ error: "URL did not return an image" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }
    
    const imageBlob = await imageResponse.blob()
    const uniqueFileName = `${userId}/${fileName || 'image'}-${Date.now()}.webp`
    
    // Create a Supabase client with service role key for storage operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseServiceKey) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const bucketName = 'images'
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      console.log("Creating images bucket...")
      const { error: bucketError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: false,
          fileSizeLimit: 5242880,
        })
      if (bucketError) {
        console.error("Error creating bucket:", bucketError)
        throw bucketError
      }
    }
    
    console.log("Uploading to Supabase Storage with filename:", uniqueFileName)
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(uniqueFileName, imageBlob, {
        contentType: 'image/webp',
        upsert: true,
      })
      
    if (error) {
      console.error("Error uploading image:", error)
      throw error
    }
    
    // Generate a signed URL instead of public URL
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(data.path, 3600 * 24 * 7) // 7 days
    
    if (signedUrlError) {
      throw signedUrlError
    }
      
    console.log("Image successfully stored")
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: signedUrlData.signedUrl,
        path: data.path
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
    
  } catch (error: unknown) {
    console.error("Error in save-image-to-storage function:", error)
    return new Response(
      JSON.stringify({ error: "An error occurred while saving the image" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
