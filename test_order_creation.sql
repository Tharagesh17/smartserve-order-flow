-- Test script to check if basic order creation works
-- Run this in your Supabase SQL editor

-- First, let's check if we have any restaurants
SELECT id, name FROM restaurants LIMIT 5;

-- Try to create a test order
INSERT INTO orders (
  order_id,
  restaurant_id,
  total_amount,
  payment_method,
  payment_status,
  order_status
) VALUES (
  'TEST_ORDER_001',
  (SELECT id FROM restaurants LIMIT 1),
  100.00,
  'cash',
  'pending',
  'pending'
) RETURNING *;

-- Check if the order was created
SELECT * FROM orders WHERE order_id = 'TEST_ORDER_001';

-- Clean up test data
DELETE FROM orders WHERE order_id = 'TEST_ORDER_001';

