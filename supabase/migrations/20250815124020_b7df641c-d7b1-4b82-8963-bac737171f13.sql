-- Fix security vulnerability: Remove overly permissive orders SELECT policy
-- This policy currently allows ANYONE to view ALL orders with customer data

-- Drop the vulnerable policy that allows anyone to view all orders
DROP POLICY IF EXISTS "Anyone can view orders they created" ON public.orders;

-- The existing "Restaurant owners can view their orders" policy is sufficient
-- It already allows restaurant owners to view orders for their restaurants:
-- EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid())

-- Note: Customers are not authenticated users in this system, so they don't need
-- a SELECT policy. They receive order confirmation through the OrderSuccess page
-- after placing an order, but cannot query the database directly.