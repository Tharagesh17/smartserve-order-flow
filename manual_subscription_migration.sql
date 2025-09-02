-- Manual migration to add subscription system
-- Run this in your Supabase SQL editor

-- 1. Add subscription fields to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS subscription_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS free_order_limit INTEGER DEFAULT 50;

-- 2. Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'INR',
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    max_orders INTEGER DEFAULT NULL, -- NULL means unlimited
    features JSONB DEFAULT '{}',
    razorpay_plan_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ NOT NULL,
    razorpay_subscription_id TEXT,
    razorpay_plan_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_subscriptions_unique_active UNIQUE (user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- 4. Create order tracking table
CREATE TABLE IF NOT EXISTS public.user_order_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_count INTEGER DEFAULT 0,
    reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_order_counts_unique UNIQUE (user_id, restaurant_id, reset_date)
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON public.user_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_user_order_counts_user_restaurant ON public.user_order_counts(user_id, restaurant_id);
CREATE INDEX IF NOT EXISTS idx_user_order_counts_reset_date ON public.user_order_counts(reset_date);

-- 6. Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_order_counts_updated_at ON public.user_order_counts;
CREATE TRIGGER update_user_order_counts_updated_at
    BEFORE UPDATE ON public.user_order_counts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create helper functions
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_subscriptions 
        WHERE user_id = user_uuid 
        AND status = 'active' 
        AND end_date > now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_order_count(user_uuid UUID, restaurant_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    order_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(order_count), 0) INTO order_count
    FROM public.user_order_counts 
    WHERE user_id = user_uuid 
    AND restaurant_id = restaurant_uuid;
    
    RETURN order_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_user_order_count(user_uuid UUID, restaurant_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_order_counts (user_id, restaurant_id, order_count, reset_date)
    VALUES (user_uuid, restaurant_uuid, 1, CURRENT_DATE)
    ON CONFLICT (user_id, restaurant_id, reset_date)
    DO UPDATE SET 
        order_count = user_order_counts.order_count + 1,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Insert subscription plans that match existing Razorpay plans
INSERT INTO public.subscription_plans (name, description, price, duration_days, max_orders, features, razorpay_plan_id) VALUES
('Basic Plan', 'Basic plan for small restaurants with essential features', 499, 30, 500, '{"unlimited_orders": false, "basic_analytics": true, "order_limit": 500}', 'plan_RCMaqxTG2HMHre'),
('Advanced Plan', 'Advanced plan for growing restaurants with enhanced features', 799, 30, 2000, '{"unlimited_orders": false, "advanced_analytics": true, "priority_support": true, "order_limit": 2000}', 'plan_RCMcTmFjcMh8r8'),
('Premium Plan', 'Premium plan with unlimited orders and maximum features', 999, 30, NULL, '{"unlimited_orders": true, "advanced_analytics": true, "priority_support": true, "custom_branding": true, "multiple_locations": true}', 'plan_RCMeipcFQ6qSGq')
ON CONFLICT (name) DO NOTHING;

-- 9. Create RLS policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_order_counts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "subscription_plans_select_policy" ON public.subscription_plans;
DROP POLICY IF EXISTS "user_subscriptions_select_policy" ON public.user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_insert_policy" ON public.user_subscriptions;
DROP POLICY IF EXISTS "user_subscriptions_update_policy" ON public.user_subscriptions;
DROP POLICY IF EXISTS "user_order_counts_select_policy" ON public.user_order_counts;
DROP POLICY IF EXISTS "user_order_counts_insert_policy" ON public.user_order_counts;
DROP POLICY IF EXISTS "user_order_counts_update_policy" ON public.user_order_counts;

-- Subscription plans are public
CREATE POLICY "subscription_plans_select_policy" ON public.subscription_plans
    FOR SELECT USING (true);

-- Users can only see their own subscriptions
CREATE POLICY "user_subscriptions_select_policy" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_policy" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_policy" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own order counts
CREATE POLICY "user_order_counts_select_policy" ON public.user_order_counts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_order_counts_insert_policy" ON public.user_order_counts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_order_counts_update_policy" ON public.user_order_counts
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. Update restaurants_public view
DROP VIEW IF EXISTS public.restaurants_public;
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

GRANT SELECT ON public.restaurants_public TO anon;
GRANT SELECT ON public.restaurants_public TO authenticated;

-- Check the current schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND table_schema = 'public'
ORDER BY ordinal_position;
