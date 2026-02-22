
-- Create a function to add free credits to a user's profile
CREATE OR REPLACE FUNCTION public.add_credits(amount integer)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
    UPDATE public.profiles 
    SET credits = credits + amount
    WHERE id = auth.uid()
    RETURNING credits;
$$;
