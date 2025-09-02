# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for your SmartServe application.

## Prerequisites

1. A Razorpay account (sign up at https://razorpay.com)
2. Supabase project with Edge Functions enabled
3. Environment variables configured

## Step 1: Razorpay Account Setup

1. **Create Razorpay Account**
   - Sign up at https://razorpay.com
   - Complete KYC verification
   - Activate your account

2. **Get API Keys**
   - Go to Settings → API Keys in your Razorpay Dashboard
   - Copy your `Key ID` and `Key Secret`
   - For testing, use the test keys (they start with `rzp_test_`)

## Step 2: Configure Supabase Environment Variables

1. **Go to your Supabase Dashboard**
   - Navigate to Settings → API
   - Find your project URL and anon key

2. **Set Edge Function Environment Variables**
   - Go to Settings → Edge Functions
   - Add the following environment variables:
     ```
     RZP_KEY_ID=your_razorpay_key_id
     RZP_KEY_SECRET=your_razorpay_key_secret
     ```

## Step 3: Deploy Supabase Edge Functions

1. **Deploy the payments-razorpay function**
   ```bash
   supabase functions deploy payments-razorpay
   ```

2. **Verify deployment**
   - Check the Edge Functions section in your Supabase dashboard
   - Ensure the function is active and has the correct environment variables

## Step 4: Run Database Migrations

1. **Apply the new migration**
   ```bash
   supabase db push
   ```

2. **Verify the new fields are added**
   - Check that the `orders` table has the new Razorpay fields:
     - `razorpay_order_id`
     - `payment_currency`
     - `razorpay_signature`

## Step 5: Test the Integration

1. **Test with Test Keys**
   - Use Razorpay test cards for testing
   - Test card numbers: 4111 1111 1111 1111
   - Any future expiry date
   - Any 3-digit CVV

2. **Test Payment Flow**
   - Add items to cart
   - Select "Pay Online"
   - Complete payment with test card
   - Verify order is created and payment is marked as successful

## Step 6: Go Live (Production)

1. **Switch to Live Keys**
   - Replace test keys with live keys in Supabase environment variables
   - Update the Razorpay script URL if needed (should work with the same URL)

2. **Update Frontend Environment**
   - Ensure your frontend has the correct Supabase URL and keys
   - Test the complete flow in production

## Payment Flow

1. **Customer adds items to cart**
2. **Customer selects "Pay Online"**
3. **Order is created in database with pending status**
4. **Razorpay order is created via Edge Function**
5. **Payment modal opens with Razorpay checkout**
6. **Customer completes payment**
7. **Payment is verified via Edge Function**
8. **Order status is updated to paid**
9. **Success message is shown to customer**

## Supported Payment Methods

- Credit/Debit Cards
- UPI (Unified Payments Interface)
- Net Banking
- Wallets (Paytm, PhonePe, etc.)
- EMI options

## Error Handling

The integration includes comprehensive error handling:
- Payment failures are caught and displayed to users
- Failed payments don't create orders
- Network errors are handled gracefully
- Payment verification ensures security

## Security Features

- Payment signature verification
- Server-side payment processing
- Secure API key storage in environment variables
- HTTPS-only communication

## Troubleshooting

### Common Issues

1. **"Razorpay is not loaded"**
   - Check if the Razorpay script is loading in the browser
   - Verify the script URL in index.html

2. **"Failed to create payment order"**
   - Check Supabase Edge Function logs
   - Verify environment variables are set correctly
   - Ensure Razorpay keys are valid

3. **"Payment verification failed"**
   - Check if the payment was actually successful
   - Verify the signature verification logic
   - Check Edge Function logs for details

### Debug Steps

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests to Supabase

2. **Check Supabase Logs**
   - Go to Edge Functions → Logs
   - Look for errors in the payments-razorpay function

3. **Test Edge Function Directly**
   - Use the Supabase dashboard to test the function
   - Verify it returns the expected response

## Support

For issues with:
- **Razorpay**: Contact Razorpay support
- **Supabase**: Check Supabase documentation
- **SmartServe Integration**: Check this documentation or create an issue

## Environment Variables Reference

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Edge Functions
```
RZP_KEY_ID=your_razorpay_key_id
RZP_KEY_SECRET=your_razorpay_key_secret
```
