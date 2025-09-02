-- Test script to verify subscription system setup
-- Run this in your Supabase SQL editor to check if everything is set up correctly

-- 1. Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'user_order_counts')
ORDER BY table_name;

-- 2. Check subscription_plans table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if subscription_plans has data
SELECT 
    COUNT(*) as plan_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
        ELSE '❌ NO DATA'
    END as status
FROM subscription_plans;

-- 4. Check if restaurants table has new columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND table_schema = 'public'
AND column_name IN ('subscription_required', 'free_order_limit')
ORDER BY ordinal_position;

-- 5. Check if restaurants_public view exists and has new columns
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'restaurants_public' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check if helper functions exist
SELECT 
    routine_name,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('has_active_subscription', 'get_user_order_count', 'increment_user_order_count')
ORDER BY routine_name;

-- 7. Test helper functions (if they exist)
-- Note: These will only work if you have a user_id to test with
-- SELECT has_active_subscription('00000000-0000-0000-0000-000000000000') as test_result;
-- SELECT get_user_order_count('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000') as test_result;
