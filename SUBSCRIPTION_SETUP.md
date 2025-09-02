# Subscription System Setup Guide

This guide will help you set up the subscription system for your SmartServe application.

## Overview

The subscription system includes:
- Subscription plans with different tiers (Basic/Premium, Monthly/Yearly)
- User subscription tracking
- Order limit enforcement (50 free orders for non-subscribers)
- Dashboard access control
- Razorpay integration for payments

## Prerequisites

1. Supabase project with Edge Functions enabled
2. Razorpay account and API keys
3. Existing SmartServe application

## Step 1: Database Setup

1. **Run the manual migration**
   - Open your Supabase SQL editor
   - Copy and paste the contents of `manual_subscription_migration.sql`
   - Execute the migration

2. **Verify the tables are created**
   - Check that the following tables exist:
     - `subscription_plans`
     - `user_subscriptions`
     - `user_order_counts`
   - Verify the `restaurants` table has the new columns:
     - `subscription_required`
     - `free_order_limit`

## Step 2: Deploy Edge Functions

1. **Deploy the subscription-payments function**
   ```bash
   supabase functions deploy subscription-payments
   ```

2. **Verify deployment**
   - Check the Edge Functions section in your Supabase dashboard
   - Ensure the function is active

## Step 3: Configure Environment Variables

1. **Set Razorpay credentials in Supabase**
   - Go to Settings → Edge Functions
   - Add the following environment variables:
     ```
     RZP_KEY_ID=your_razorpay_key_id
     RZP_KEY_SECRET=your_razorpay_key_secret
     ```

## Step 4: Frontend Setup

1. **Install dependencies** (if needed)
   ```bash
   cd frontend
   npm install
   ```

2. **Build and deploy**
   ```bash
   npm run build
   ```

## Step 5: Test the System

1. **Test subscription plans page**
   - Navigate to `/subscription`
   - Verify plans are displayed correctly

2. **Test subscription purchase**
   - Click "Subscribe Now" on a plan
   - Complete payment with Razorpay test card
   - Verify subscription is activated

3. **Test order limits**
   - Place orders until you reach the 50-order limit
   - Verify the limit warning appears
   - Subscribe and verify unlimited orders work

4. **Test dashboard access**
   - Verify non-subscribers see subscription prompt
   - Verify subscribers can access full dashboard

## Features

### Subscription Plans
- **Basic Plan**: ₹499/month - 500 orders, basic analytics
- **Advanced Plan**: ₹799/month - 2,000 orders, advanced analytics, priority support
- **Premium Plan**: ₹999/month - Unlimited orders, advanced analytics, priority support, custom branding, multiple locations

### Free Plan
- 50 free orders per restaurant
- Basic features only
- No credit card required

### Order Tracking
- Tracks orders per user per restaurant
- Resets daily
- Enforces limits for non-subscribers

### Dashboard Access
- Non-subscribers see subscription prompt
- Subscribers get full dashboard access
- Subscription status displayed

## API Endpoints

### Subscription Payments Function
- `create_subscription`: Create new subscription
- `verify_subscription_payment`: Verify payment and activate subscription
- `get_subscription_status`: Get user's subscription status

### Database Functions
- `has_active_subscription(user_uuid)`: Check if user has active subscription
- `get_user_order_count(user_uuid, restaurant_uuid)`: Get user's order count
- `increment_user_order_count(user_uuid, restaurant_uuid)`: Increment order count

## Security

- Row Level Security (RLS) enabled on all subscription tables
- Users can only access their own subscription data
- Payment verification with Razorpay signatures
- Secure API key storage

## Troubleshooting

### Common Issues

1. **"Subscription plans not loading"**
   - Check if `subscription_plans` table exists
   - Verify RLS policies are correct

2. **"Payment verification failed"**
   - Check Razorpay API keys
   - Verify Edge Function environment variables

3. **"Order limit not working"**
   - Check `user_order_counts` table
   - Verify `increment_user_order_count` function

4. **"Dashboard access denied"**
   - Check `has_active_subscription` function
   - Verify subscription status in database

### Database Queries

Check subscription status:
```sql
SELECT * FROM user_subscriptions WHERE user_id = 'user-uuid' AND status = 'active';
```

Check order count:
```sql
SELECT * FROM user_order_counts WHERE user_id = 'user-uuid' AND restaurant_id = 'restaurant-uuid';
```

## Support

For issues or questions:
1. Check the Supabase logs for Edge Function errors
2. Verify all environment variables are set
3. Test with Razorpay test cards first
4. Check browser console for frontend errors

## Troubleshooting Edge Function 500 Error

If you encounter a 500 error when creating subscriptions, follow these steps:

1. **Run the database test script:**
   ```sql
   -- Copy and paste the contents of test_subscription_setup.sql
   -- Run it in your Supabase SQL editor
   ```

2. **Check environment variables:**
   - Go to your Supabase dashboard
   - Navigate to Settings > API
   - Verify that `RZP_KEY_ID` and `RZP_KEY_SECRET` are set in Edge Functions

3. **Deploy the Edge Function:**
   ```bash
   cd supabase
   npx supabase functions deploy subscription-payments
   ```

4. **Check Edge Function logs:**
   - Go to your Supabase dashboard
   - Navigate to Edge Functions
   - Click on `subscription-payments`
   - Check the logs for any errors

5. **Verify database schema:**
   - Ensure all tables exist with correct columns
   - Check that the `razorpay_plan_id` column exists in `subscription_plans`
   - Verify that default subscription plans are inserted

### Quick Fixes

1. **Missing `razorpay_plan_id` column:**
   ```sql
   ALTER TABLE public.subscription_plans 
   ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT;
   ```

2. **Missing subscription plans:**
   ```sql
   INSERT INTO public.subscription_plans (name, description, price, duration_days, max_orders, features) VALUES
   ('Basic Monthly', 'Basic plan for small restaurants', 999, 30, 1000, '{"unlimited_orders": true, "basic_analytics": true}'),
   ('Premium Monthly', 'Premium plan with advanced features', 1999, 30, NULL, '{"unlimited_orders": true, "advanced_analytics": true, "priority_support": true}'),
   ('Basic Yearly', 'Basic plan for small restaurants (yearly)', 9999, 365, 12000, '{"unlimited_orders": true, "basic_analytics": true, "discount": true}'),
   ('Premium Yearly', 'Premium plan with advanced features (yearly)', 19999, 365, NULL, '{"unlimited_orders": true, "advanced_analytics": true, "priority_support": true, "discount": true}')
   ON CONFLICT (name) DO NOTHING;
   ```

3. **Missing environment variables:**
   - Set `RZP_KEY_ID` and `RZP_KEY_SECRET` in Supabase Edge Functions settings
