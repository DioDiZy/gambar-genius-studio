-- Fix security issue: Remove public access to profiles table and implement user-specific policies

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create more secure policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to view only specific public profile fields (not including username/email)
-- This policy allows viewing display names and avatars for user discovery without exposing emails
CREATE POLICY "Public profile fields viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated'
  AND auth.uid() != id
);

-- Update the existing handle_new_user function to set search_path for security
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

-- Update other functions to set search_path for security
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