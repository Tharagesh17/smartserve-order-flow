-- Test Data for Hotel Type Segmentation
-- This script creates test accounts for each hotel type to verify feature restrictions

-- Test Food Cart Account
INSERT INTO public.restaurants (
  id,
  name,
  location,
  contact_email,
  contact_phone,
  hotel_type,
  owner_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Tasty Food Cart',
  '123 Main Street, Downtown',
  'cart@tastyfood.com',
  '+1 (555) 123-4567',
  'cart',
  gen_random_uuid(),
  true,
  now(),
  now()
);

-- Test Restaurant Account
INSERT INTO public.restaurants (
  id,
  name,
  location,
  contact_email,
  contact_phone,
  hotel_type,
  owner_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Fine Dining Restaurant',
  '456 Oak Avenue, Uptown',
  'info@finedining.com',
  '+1 (555) 234-5678',
  'restaurant',
  gen_random_uuid(),
  true,
  now(),
  now()
);

-- Test Hotel Account
INSERT INTO public.restaurants (
  id,
  name,
  location,
  contact_email,
  contact_phone,
  hotel_type,
  owner_id,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Grand Hotel & Resort',
  '789 Luxury Boulevard, Resort District',
  'reservations@grandhotel.com',
  '+1 (555) 345-6789',
  'hotel',
  gen_random_uuid(),
  true,
  now(),
  now()
);

-- Verify the data was created
SELECT 
  name,
  hotel_type,
  location,
  is_active,
  created_at
FROM public.restaurants 
WHERE hotel_type IN ('cart', 'restaurant', 'hotel')
ORDER BY hotel_type;
