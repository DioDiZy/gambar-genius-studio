CREATE POLICY "Users can delete their own images"
ON public.images
FOR DELETE
USING (auth.uid() = user_id);