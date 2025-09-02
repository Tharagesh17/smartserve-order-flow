-- Update existing database to match Razorpay plans
-- Run this in your Supabase SQL editor

-- 1. Add the missing razorpay_plan_id column if it doesn't exist
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;

-- 2. Clear existing plans and insert new ones that match your Razorpay dashboard
DELETE FROM public.subscription_plans;

-- 3. Insert the correct plans with your existing Razorpay plan IDs
INSERT INTO public.subscription_plans (name, description, price, duration_days, max_orders, features, razorpay_plan_id) VALUES
('Basic Plan', 'Basic plan for small restaurants with essential features', 499, 30, 500, '{"unlimited_orders": false, "basic_analytics": true, "order_limit": 500}', 'plan_RCMaqxTG2HMHre'),
('Advanced Plan', 'Advanced plan for growing restaurants with enhanced features', 799, 30, 2000, '{"unlimited_orders": false, "advanced_analytics": true, "priority_support": true, "order_limit": 2000}', 'plan_RCMcTmFjcMh8r8'),
('Premium Plan', 'Premium plan with unlimited orders and maximum features', 999, 30, NULL, '{"unlimited_orders": true, "advanced_analytics": true, "priority_support": true, "custom_branding": true, "multiple_locations": true}', 'plan_RCMeipcFQ6qSGq');

-- 4. Verify the plans were inserted correctly
SELECT 
    id,
    name,
    price,
    duration_days,
    max_orders,
    razorpay_plan_id,
    features
FROM public.subscription_plans 
ORDER BY price ASC;
