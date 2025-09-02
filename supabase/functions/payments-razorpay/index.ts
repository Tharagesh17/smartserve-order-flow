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

// Create Razorpay order
async function createRazorpayOrder(params: {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const auth = btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      payment_capture: 1, // Auto-capture payment
      notes: params.notes || {}
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Razorpay API error:', errorText);
    throw new Error(`Razorpay create order failed: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

// Verify Razorpay signature
async function verifySignature(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) {
  const crypto = await import('https://deno.land/std@0.168.0/node/crypto.ts');
  const hmac = crypto.createHmac('sha256', RZP_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === razorpay_signature;
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();

    // Create order action
    if (action === 'create_order') {
      const { amount, currency = 'INR', receipt, db_order_id, notes } = payload;
      
      // Validate required parameters
      if (!amount || !receipt || !db_order_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters: amount, receipt, or db_order_id' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the order exists in database before proceeding
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', db_order_id)
        .single();

      if (orderError || !order) {
        return new Response(
          JSON.stringify({ error: 'Order not found in database' }), 
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create Razorpay order
      const rzpOrder = await createRazorpayOrder({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes
      });

      // Update the order in database with Razorpay order ID
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          razorpay_order_id: rzpOrder.id, 
          payment_status: 'pending', 
          payment_method: 'online', 
          payment_currency: currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', db_order_id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Return success response with order details
      return new Response(
        JSON.stringify({
          key_id: RZP_KEY_ID,
          order: rzpOrder
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment action
    if (action === 'verify_payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id, amount } = payload;
      
      // Validate required parameters
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required payment verification parameters' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the signature
      const isSignatureValid = await verifySignature(
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature
      );

      if (!isSignatureValid) {
        return new Response(
          JSON.stringify({ error: 'Signature verification failed' }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update order status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_id: razorpay_payment_id, 
          payment_status: 'paid',
          razorpay_signature: razorpay_signature,
          updated_at: new Date().toISOString()
        })
        .eq('id', db_order_id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Create payment record
      if (amount) {
        await supabase
          .from('payments')
          .insert([{
            order_id: db_order_id,
            razorpay_order_id,
            razorpay_payment_id,
            signature: razorpay_signature,
            amount: amount,
            status: 'captured',
            method: 'razorpay',
            created_at: new Date().toISOString()
          }])
          .catch(err => console.error('Payment record creation error:', err));
      }

      return new Response(
        JSON.stringify({ success: true }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({ error: 'Unknown action' }), 
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Payments Razorpay error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});