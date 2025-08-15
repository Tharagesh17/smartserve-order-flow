-- Fix function search path vulnerability
-- Set secure search_path for all existing functions to prevent injection attacks

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
  RETURN NEW;
END;
$function$;

-- Fix generate_order_id function
CREATE OR REPLACE FUNCTION public.generate_order_id()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  new_order_id TEXT;
  existing_count INTEGER;
BEGIN
  LOOP
    new_order_id := 'ORD' || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0');
    
    SELECT COUNT(*) INTO existing_count 
    FROM public.orders 
    WHERE orders.order_id = new_order_id;
    
    EXIT WHEN existing_count = 0;
  END LOOP;
  
  RETURN new_order_id;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;