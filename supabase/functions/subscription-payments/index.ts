import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Razorpay credentials
const RZP_KEY_ID = Deno.env.get('RZP_KEY_ID') ?? '';
const RZP_KEY_SECRET = Deno.env.get('RZP_KEY_SECRET') ?? '';

// Create Razorpay subscription
async function createRazorpaySubscription(params: {
  plan_id: string;
  customer_notify: number;
  total_count: number;
  notes?: Record<string, string>;
}) {
  const auth = btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);
  const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan_id: params.plan_id,
      customer_notify: params.customer_notify,
      total_count: params.total_count,
      notes: params.notes || {}
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Razorpay API error:', errorText);
    throw new Error(`Razorpay create subscription failed: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

// Create Razorpay plan
async function createRazorpayPlan(params: {
  period: string;
  interval: number;
  item: {
    name: string;
    amount: number;
    currency: string;
    description?: string;
  };
  notes?: Record<string, string>;
}) {
  const auth = btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);
  const res = await fetch('https://api.razorpay.com/v1/plans', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      period: params.period,
      interval: params.interval,
      item: params.item,
      notes: params.notes || {}
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Razorpay API error:', errorText);
    throw new Error(`Razorpay create plan failed: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

// Verify Razorpay signature
async function verifySignature(razorpay_subscription_id: string, razorpay_payment_id: string, razorpay_signature: string) {
  const text = `${razorpay_subscription_id}|${razorpay_payment_id}`;
  const crypto = await import('https://deno.land/std@0.168.0/crypto/mod.ts');
  const key = await crypto.importKey(
    'raw',
    new TextEncoder().encode(RZP_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.sign('HMAC', key, new TextEncoder().encode(text));
  const generatedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return generatedSignature === razorpay_signature;
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Request received:', req.method, req.url);
    
    // Check if environment variables are set
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
      console.error('Missing Razorpay environment variables');
      return new Response(
        JSON.stringify({ error: 'Payment gateway configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...payload } = await req.json();
    console.log('Action:', action, 'Payload:', payload);

    // Create subscription action
    if (action === 'create_subscription') {
      console.log('Creating subscription...');
      const { user_id, plan_id, customer_notify = 1, total_count = 1, notes } = payload;
      
      // Validate required parameters
      if (!user_id || !plan_id) {
        console.error('Missing required parameters:', { user_id, plan_id });
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: user_id or plan_id' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Fetching subscription plan...');
      // Get subscription plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', plan_id)
        .single();

      if (planError) {
        console.error('Plan fetch error:', planError);
        return new Response(
          JSON.stringify({ error: 'Database error: ' + planError.message }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!plan) {
        console.error('Plan not found:', plan_id);
        return new Response(
          JSON.stringify({ error: 'Subscription plan not found' }), 
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Plan found:', plan.name);

      // Check if user already has an active subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single();

      if (existingSubscription) {
        return new Response(
          JSON.stringify({ error: 'User already has an active subscription' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use existing Razorpay plan ID
      const razorpayPlanId = plan.razorpay_plan_id;
      if (!razorpayPlanId) {
        console.error('No Razorpay plan ID found for plan:', plan.name);
        return new Response(
          JSON.stringify({ error: 'Subscription plan not properly configured with Razorpay' }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Using existing Razorpay plan ID:', razorpayPlanId);

      // Create Razorpay subscription
      const rzpSubscription = await createRazorpaySubscription({
        plan_id: razorpayPlanId,
        customer_notify,
        total_count,
        notes: {
          user_id,
          plan_name: plan.name,
          ...notes
        }
      });

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Create subscription record in database
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id,
          plan_id,
          status: 'pending',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          razorpay_subscription_id: rzpSubscription.id,
          razorpay_plan_id: razorpayPlanId,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('Database insert error:', subscriptionError);
        throw subscriptionError;
      }

      // Return success response
      return new Response(
        JSON.stringify({
          key_id: RZP_KEY_ID,
          subscription: rzpSubscription,
          db_subscription: subscription
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify subscription payment action
    if (action === 'verify_subscription_payment') {
      const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, user_id } = payload;
      
      // Validate required parameters
      if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature || !user_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required payment verification parameters' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the signature
      const isSignatureValid = await verifySignature(
        razorpay_subscription_id, 
        razorpay_payment_id, 
        razorpay_signature
      );

      if (!isSignatureValid) {
        return new Response(
          JSON.stringify({ error: 'Signature verification failed' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update subscription status in database
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'active',
          payment_status: 'paid',
          razorpay_signature: razorpay_signature,
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_subscription_id', razorpay_subscription_id)
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Subscription activated successfully'
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subscription status action
    if (action === 'get_subscription_status') {
      const { user_id } = payload;
      
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'Missing user_id parameter' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            description,
            price,
            currency,
            duration_days,
            max_orders,
            features
          )
        `)
        .eq('user_id', user_id)
        .eq('status', 'active')
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError;
      }

      return new Response(
        JSON.stringify({ 
          subscription: subscription || null,
          has_active_subscription: !!subscription
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
