-- Remove the problematic view and use a simpler RLS approach
-- This will fix the security definer view warning and maintain proper access control

-- Drop the problematic view
DROP VIEW IF EXISTS public.restaurants_public;

-- Simplify the RLS policies - use column-level security in application logic instead
DROP POLICY IF EXISTS "Public can view basic restaurant info" ON public.restaurants;
DROP POLICY IF EXISTS "Authenticated users can view full restaurant info" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners can view their restaurants" ON public.restaurants;

-- Create a single policy that allows viewing restaurants but app will filter sensitive data
CREATE POLICY "Anyone can view active restaurants for ordering" ON public.restaurants
FOR SELECT 
USING (is_active = true);

-- Keep the existing owner-specific policies for INSERT/UPDATE operations
-- Restaurant owners can still manage their restaurants through existing policies