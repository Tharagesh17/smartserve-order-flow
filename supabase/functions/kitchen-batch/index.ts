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
    
    if (req.method === 'GET' && pathParts[1] === 'batch-view') {
      // GET /batch-view/:restaurant_id
      const restaurantId = pathParts[2];
      
      const { data: batchItems, error } = await supabase
        .from('order_items')
        .select(`
          menu_item_id,
          menu_items(name, category),
          quantity,
          status,
          orders(order_id, restaurant_id)
        `)
        .eq('orders.restaurant_id', restaurantId)
        .in('status', ['pending', 'preparing'])
        .order('menu_item_id');

      if (error) {
        console.error('Error fetching batch items:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Group items by menu_item_id
      const grouped = batchItems.reduce((acc: any, item: any) => {
        const key = item.menu_item_id;
        if (!acc[key]) {
          acc[key] = {
            menu_item_id: key,
            name: item.menu_items.name,
            category: item.menu_items.category,
            total_quantity: 0,
            order_ids: [],
            status: 'pending' // Will be updated based on all items
          };
        }
        acc[key].total_quantity += item.quantity;
        acc[key].order_ids.push(item.orders.order_id);
        
        // Update status logic: if any item is preparing, overall is preparing
        if (item.status === 'preparing') {
          acc[key].status = 'preparing';
        }
        
        return acc;
      }, {});

      const result = Object.values(grouped);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && pathParts[1] === 'mark-ready') {
      // POST /mark-ready/:menu_item_id
      const menuItemId = pathParts[2];
      const { restaurant_id } = await req.json();

      // Update all pending/preparing order items for this menu item
      const { error } = await supabase
        .from('order_items')
        .update({ status: 'ready' })
        .eq('menu_item_id', menuItemId)
        .in('status', ['pending', 'preparing'])
        .in('order_id', 
          supabase
            .from('orders')
            .select('id')
            .eq('restaurant_id', restaurant_id)
        );

      if (error) {
        console.error('Error updating batch items:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in kitchen-batch function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});