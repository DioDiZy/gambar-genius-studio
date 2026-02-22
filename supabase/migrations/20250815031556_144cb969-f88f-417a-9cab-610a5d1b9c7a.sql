-- Fix security vulnerability: Remove policy that exposes sensitive user data
-- Drop the policy that allows authenticated users to view other users' sensitive information
DROP POLICY IF EXISTS "Limited public profile access" ON public.profiles;

-- Ensure users can only view their own complete profile data
-- This policy should already exist but let's make sure it's properly defined
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- If public profile viewing is needed in the future, create a separate public_profiles table
-- or implement application-level filtering to only show safe fields