CREATE TABLE public.storybooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  page_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own storybooks"
ON public.storybooks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storybooks"
ON public.storybooks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storybooks"
ON public.storybooks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storybooks"
ON public.storybooks FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_storybooks_updated_at
BEFORE UPDATE ON public.storybooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_storybooks_user_created ON public.storybooks(user_id, created_at DESC);