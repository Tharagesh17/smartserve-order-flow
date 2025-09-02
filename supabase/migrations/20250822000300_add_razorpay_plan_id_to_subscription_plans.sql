-- Add razorpay_plan_id field to subscription_plans table
-- This field is needed for the Edge Function to store Razorpay plan IDs

ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;

