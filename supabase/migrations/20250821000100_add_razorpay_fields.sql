-- Add Razorpay payment fields to orders table
-- This migration adds fields needed for Razorpay payment processing

-- Add Razorpay-specific fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Create index for Razorpay order ID lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);

-- Add comment for documentation
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay order ID for payment tracking';
COMMENT ON COLUMN public.orders.payment_currency IS 'Payment currency (default: INR)';
COMMENT ON COLUMN public.orders.razorpay_signature IS 'Razorpay payment signature for verification';
