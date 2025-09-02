-- Update restaurants_public view to include subscription fields
-- This migration updates the public view to include subscription_required and free_order_limit fields

-- Drop the existing view
DROP VIEW IF EXISTS public.restaurants_public;

-- Recreate the view with subscription fields
CREATE VIEW public.restaurants_public AS
SELECT 
    id,
    name,
    location,
    is_active,
    ordering_url,
    qr_code_url,
    created_at,
    updated_at,
    subscription_required,
    free_order_limit
FROM public.restaurants
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON public.restaurants_public TO anon;
GRANT SELECT ON public.restaurants_public TO authenticated;
