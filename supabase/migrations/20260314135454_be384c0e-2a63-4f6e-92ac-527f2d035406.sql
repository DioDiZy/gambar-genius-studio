
-- Create storage bucket for character reference images
INSERT INTO storage.buckets (id, name, public)
VALUES ('character_references', 'character_references', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to character_references bucket
CREATE POLICY "Authenticated users can upload character references"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'character_references');

-- Allow public read access
CREATE POLICY "Public read access for character references"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'character_references');

-- Allow users to delete own character references
CREATE POLICY "Users can delete own character references"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'character_references');
