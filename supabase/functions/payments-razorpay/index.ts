import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RZP_KEY_ID = Deno.env.get('RZP_KEY_ID') ?? '';
const RZP_KEY_SECRET = Deno.env.get('RZP_KEY_SECRET') ?? '';

async function createRazorpayOrder(params: {
  amount: number; // paise
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
      payment_capture: 1,
      notes: params.notes || {}
    })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Razorpay create order failed: ${txt}`);
  }
  return await res.json();
}

async function verifySignature(razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(RZP_KEY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = `${razorpay_order_id}|${razorpay_payment_id}`;
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === razorpay_signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();

    if (action === 'create_order') {
      const { amount, currency = 'INR', receipt, db_order_id, notes } = payload;
      if (!amount || !receipt || !db_order_id) {
        return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const rzpOrder = await createRazorpayOrder({ amount, currency, receipt, notes });

      const { error: updateErr } = await supabase
        .from('orders')
        .update({ razorpay_order_id: rzpOrder.id, payment_status: 'initiated', payment_method: 'online', payment_currency: currency })
        .eq('id', db_order_id);

      if (updateErr) throw updateErr;

      return new Response(JSON.stringify({
        key_id: RZP_KEY_ID,
        order: rzpOrder
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'verify_payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, db_order_id, amount } = payload;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !db_order_id) {
        return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const ok = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!ok) {
        return new Response(JSON.stringify({ error: 'Signature mismatch' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { error: updErr } = await supabase
        .from('orders')
        .update({ payment_id: razorpay_payment_id, payment_status: 'paid' })
        .eq('id', db_order_id);
      if (updErr) throw updErr;

      // Optional: log payment
      if (amount) {
        await supabase.from('payments').insert([{
          order_id: db_order_id,
          razorpay_order_id,
          razorpay_payment_id,
          signature: razorpay_signature,
          amount: amount,
          status: 'captured',
          method: 'razorpay'
        }]).catch(() => {});
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('payments-razorpay error:', e);
    return new Response(JSON.stringify({ error: e.message ?? 'Server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});


