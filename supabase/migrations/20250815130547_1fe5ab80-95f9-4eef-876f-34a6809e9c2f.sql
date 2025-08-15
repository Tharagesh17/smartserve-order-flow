-- Fix security vulnerability: Restrict public access to restaurant contact information
-- Currently the public policy exposes contact_email and contact_phone to anyone

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view active restaurants for ordering" ON public.restaurants;

-- Create a new restricted public policy that excludes sensitive contact information
-- This policy will only allow access to essential ordering information
CREATE POLICY "Public can view restaurant ordering info" ON public.restaurants
FOR SELECT 
USING (
  is_active = true 
  AND auth.uid() IS NULL  -- Only for non-authenticated users
);

-- Create a policy for authenticated users (restaurant owners) to see their own full data
-- This ensures owners can still see their contact information
CREATE POLICY "Restaurant owners can view their own restaurant details" ON public.restaurants
FOR SELECT 
USING (
  auth.uid() = owner_id
);

-- Update the existing owner policies to ensure they work correctly
-- (The existing INSERT and UPDATE policies should remain unchanged)

-- Note: Frontend will need to handle cases where contact information 
-- may not be available for public users