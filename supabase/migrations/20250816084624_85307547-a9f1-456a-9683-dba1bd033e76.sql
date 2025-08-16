-- Fix security issue: Restaurant Owner Contact Details Publicly Exposed
-- Create a secure public view that excludes sensitive contact information

-- Create a view for public restaurant data that excludes sensitive contact info
CREATE VIEW public.restaurants_public AS
SELECT 
  id,
  name,
  location,
  is_active,
  qr_code_url,
  ordering_url,
  created_at,
  updated_at
FROM public.restaurants
WHERE is_active = true;

-- Update RLS policies to be more secure
-- Remove the overly permissive policy that exposes all data
DROP POLICY IF EXISTS "Anyone can view active restaurants for ordering" ON public.restaurants;

-- Create a more restrictive policy for restaurant owners only
CREATE POLICY "Restaurant owners can view their complete restaurant data" ON public.restaurants
FOR SELECT 
USING (auth.uid() = owner_id);

-- Allow public access to the safe view only
-- Note: Views inherit RLS from underlying tables, so we need to enable RLS on the view
ALTER VIEW public.restaurants_public SET (security_barrier = true);

-- Grant public access to the safe view
GRANT SELECT ON public.restaurants_public TO anon;
GRANT SELECT ON public.restaurants_public TO authenticated;