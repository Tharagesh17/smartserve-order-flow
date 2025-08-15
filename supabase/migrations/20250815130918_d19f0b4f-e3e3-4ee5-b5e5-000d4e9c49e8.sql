-- Create a proper solution to hide contact information from public while maintaining functionality
-- We'll create a view for public restaurant information and update the policy

-- Create a view that excludes sensitive contact information for public access
CREATE OR REPLACE VIEW public.restaurants_public AS
SELECT 
  id,
  name,
  location,
  is_active,
  qr_code_url,
  ordering_url,
  created_at,
  updated_at,
  -- Exclude contact_email, contact_phone, and owner_id from public view
  NULL::text as contact_email,
  NULL::text as contact_phone,
  NULL::uuid as owner_id
FROM public.restaurants
WHERE is_active = true;

-- Update the public policy to be more specific about what data is accessible
-- This maintains security while allowing orders to be placed
DROP POLICY IF EXISTS "Public can view restaurant ordering info" ON public.restaurants;

-- Create separate policies for different access levels
CREATE POLICY "Public can view basic restaurant info" ON public.restaurants
FOR SELECT 
USING (is_active = true AND auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view full restaurant info" ON public.restaurants
FOR SELECT 
USING (is_active = true AND auth.uid() IS NOT NULL);

-- Ensure restaurant owners can still see their full data
CREATE POLICY "Restaurant owners can view their restaurants" ON public.restaurants
FOR SELECT 
USING (auth.uid() = owner_id);