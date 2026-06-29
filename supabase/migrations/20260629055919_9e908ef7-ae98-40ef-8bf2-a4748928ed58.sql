
-- 1) Fix mutable search_path on trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2) Lock down SECURITY DEFINER functions: revoke EXECUTE from anon/authenticated/public
REVOKE EXECUTE ON FUNCTION public.add_credits(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_credits(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_count(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- email_exists is intentionally callable by anon for pre-OTP email validation; keep grant
REVOKE EXECUTE ON FUNCTION public.email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;

-- 3) Hide tables from pg_graphql/anon: revoke SELECT from anon (and PUBLIC) on user-owned tables.
--    Signed-in users still need access; their RLS already restricts rows by auth.uid().
REVOKE ALL ON public.profiles FROM PUBLIC, anon;
REVOKE ALL ON public.images FROM PUBLIC, anon;
REVOKE ALL ON public.characters FROM PUBLIC, anon;
REVOKE ALL ON public.storybooks FROM PUBLIC, anon;

GRANT SELECT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.characters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.storybooks TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.images TO service_role;
GRANT ALL ON public.characters TO service_role;
GRANT ALL ON public.storybooks TO service_role;
