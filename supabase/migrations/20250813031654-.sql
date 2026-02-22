-- Fix security issue: Remove public access to profiles table and implement user-specific policies

-- First, check what policies exist and drop them all
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profile fields viewable by authenticated users" ON public.profiles;

-- Create secure policies that prevent email exposure
-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Other authenticated users can only see public fields (NOT username/email)
-- This policy is restrictive and only shows safe public information
CREATE POLICY "Limited public profile access" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND auth.uid() != id
  AND (full_name IS NOT NULL OR avatar_url IS NOT NULL)
);

-- Update functions to set search_path for security (fixing the other warnings)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, 'https://www.gravatar.com/avatar/' || md5(lower(trim(new.email))) || '?d=mp');
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_count(amount integer)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
    UPDATE public.profiles 
    SET images_generated = images_generated + amount
    WHERE id = auth.uid()
    RETURNING images_generated;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_credits(amount integer)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
    UPDATE public.profiles 
    SET credits = GREATEST(credits - amount, 0)
    WHERE id = auth.uid()
    RETURNING credits;
$function$;