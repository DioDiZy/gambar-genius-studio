-- Remove profiles from Realtime publication to prevent data leakage
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;