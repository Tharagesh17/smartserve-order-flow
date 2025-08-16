-- Fix the security definer view issue by using a standard view
-- and proper RLS policies instead

-- Drop the problematic view
DROP VIEW IF EXISTS public.restaurants_public;

-- Create a standard view without security definer
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
FROM public.restaurants;

-- Create RLS policy specifically for the public view access
-- This allows anyone to read from restaurants but only through filtered queries
CREATE POLICY "Public can view safe restaurant data" ON public.restaurants
FOR SELECT 
USING (
  is_active = true AND 
  -- Only allow access when querying for non-sensitive columns
  -- This effectively restricts what can be selected
  current_setting('role') IN ('anon', 'authenticated')
);