-- 1. Make generated_images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'generated_images';

-- 2. Replace overly permissive UPDATE policy on profiles with column-restricted version
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own safe profile fields" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND credits = (SELECT p.credits FROM public.profiles p WHERE p.id = auth.uid())
    AND images_generated = (SELECT p.images_generated FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 3. Add DELETE policy for profiles (GDPR compliance)
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
