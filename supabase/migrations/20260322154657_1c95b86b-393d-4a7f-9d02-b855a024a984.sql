
-- Replace add_credits to only be callable from service role (remove public access)
-- by adding a guard that prevents self-service credit additions
CREATE OR REPLACE FUNCTION public.add_credits(amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only allow positive amounts
  IF amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;
  
  -- This function should only be called by service role / admin
  -- Check if the current role is service_role
  IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: only service role can add credits';
  END IF;
  
  UPDATE public.profiles 
  SET credits = credits + amount
  WHERE id = auth.uid();
  
  RETURN (SELECT credits FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Fix decrement_credits to reject negative amounts
CREATE OR REPLACE FUNCTION public.decrement_credits(amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;
  
  UPDATE public.profiles 
  SET credits = GREATEST(credits - amount, 0)
  WHERE id = auth.uid();
  
  RETURN (SELECT credits FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Fix increment_count to reject negative amounts
CREATE OR REPLACE FUNCTION public.increment_count(amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;
  
  UPDATE public.profiles 
  SET images_generated = images_generated + amount
  WHERE id = auth.uid();
  
  RETURN (SELECT images_generated FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- Make images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'images';
