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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    if (req.method === 'POST' && pathParts[1] === 'process-cash-payment') {
      // POST /process-cash-payment
      const { order_id, staff_id, amount, notes } = await req.json();
      
      if (!order_id || !staff_id || !amount) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: order_id, staff_id, amount' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process cash payment using the database function
      const { data, error } = await supabase.rpc('process_cash_payment', {
        p_order_id: order_id,
        p_staff_id: staff_id,
        p_amount: amount,
        p_notes: notes || null
      });

      if (error) {
        console.error('Error processing cash payment:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && pathParts[1] === 'fifo-queue') {
      // GET /fifo-queue/:restaurant_id
      const restaurant_id = pathParts[2];
      
      if (!restaurant_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Restaurant ID is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get FIFO order queue
      const { data, error } = await supabase.rpc('get_fifo_order_queue', {
        p_restaurant_id: restaurant_id
      });

      if (error) {
        console.error('Error fetching FIFO queue:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        data: data || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && pathParts[1] === 'move-order') {
      // POST /move-order
      const { restaurant_id, order_id } = await req.json();
      
      if (!restaurant_id || !order_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: restaurant_id, order_id' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Move order to next position in queue
      const { data, error } = await supabase.rpc('move_order_to_next', {
        p_restaurant_id: restaurant_id,
        p_order_id: order_id
      });

      if (error) {
        console.error('Error moving order:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && pathParts[1] === 'staff') {
      // GET /staff/:restaurant_id
      const restaurant_id = pathParts[2];
      
      if (!restaurant_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Restaurant ID is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get staff members for the restaurant
      const { data, error } = await supabase
        .from('staff')
        .select('id, name, email, role, can_authorize_payments, is_active')
        .eq('restaurant_id', restaurant_id)
        .eq('is_active', true)
        .order('role', { ascending: true });

      if (error) {
        console.error('Error fetching staff:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        data: data || [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && pathParts[1] === 'add-staff') {
      // POST /add-staff
      const { restaurant_id, name, email, phone, role, can_authorize_payments } = await req.json();
      
      if (!restaurant_id || !name || !role) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: restaurant_id, name, role' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add new staff member
      const { data, error } = await supabase
        .from('staff')
        .insert([{
          restaurant_id,
          name,
          email: email || null,
          phone: phone || null,
          role,
          can_authorize_payments: can_authorize_payments || false
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding staff:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        data: data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cash-payment function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
