-- Fix security vulnerability: Restrict public profile access to only safe fields
-- Remove the overly permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Limited public profile access" ON public.profiles;

-- Create a new policy that only allows viewing safe, non-sensitive profile fields
-- This uses a column-level restriction approach by creating a view
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    username,
    avatar_url,
    full_name
FROM public.profiles
WHERE (full_name IS NOT NULL OR avatar_url IS NOT NULL);

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create policy for the view that allows authenticated users to see public profile info
CREATE POLICY "Authenticated users can view public profiles"
ON public.public_profiles
FOR SELECT
TO authenticated
USING (true);

-- Update the main profiles table policy to ensure users can only see their own complete profile
-- (This should already exist but let's make sure it's properly defined)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);