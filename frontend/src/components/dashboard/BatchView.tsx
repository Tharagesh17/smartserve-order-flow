import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BatchItem {
  menu_item_id: string;
  name: string;
  category: string;
  total_quantity: number;
  order_ids: string[];
  status: 'pending' | 'preparing' | 'ready';
}

interface BatchViewProps {
  restaurant: any;
}

export function BatchView({ restaurant }: BatchViewProps) {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBatchItems = async () => {
    try {
      // Fetch batch data using direct aggregation query
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          status,
          menu_items!inner(name, category_id, categories(name)),
          orders!inner(order_id, restaurant_id)
        `)
        .eq('orders.restaurant_id', restaurant.id)
        .in('status', ['pending', 'preparing']);

      if (error) throw error;

      // Group items by menu_item_id
      const grouped = (data || []).reduce((acc: any, item: any) => {
        const key = item.menu_item_id;
        if (!acc[key]) {
          acc[key] = {
            menu_item_id: key,
            name: item.menu_items.name,
            category: item.menu_items.categories?.name || 'Uncategorized',
            total_quantity: 0,
            order_ids: [],
            status: 'pending'
          };
        }
        acc[key].total_quantity += item.quantity;
        if (!acc[key].order_ids.includes(item.orders.order_id)) {
          acc[key].order_ids.push(item.orders.order_id);
        }
        
        // Update status logic: if any item is preparing, overall is preparing
        if (item.status === 'preparing') {
          acc[key].status = 'preparing';
        }
        
        return acc;
      }, {});

      setBatchItems(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching batch items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch batch items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markItemReady = async (menuItemId: string, itemName: string) => {
    try {
      // First get all order IDs for this restaurant
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('restaurant_id', restaurant.id);

      if (ordersError) throw ordersError;

      const orderIds = orders?.map(order => order.id) || [];

      // Update all pending/preparing order items for this menu item in this restaurant
      const { error } = await supabase
        .from('order_items')
        .update({ status: 'ready' })
        .eq('menu_item_id', menuItemId)
        .in('status', ['pending', 'preparing'])
        .in('order_id', orderIds);

      if (error) throw error;

      toast({
        title: "Items marked ready",
        description: `All ${itemName} items have been marked as ready`,
      });

      // Refresh the data
      fetchBatchItems();
    } catch (error) {
      console.error('Error marking items ready:', error);
      toast({
        title: "Error",
        description: "Failed to mark items as ready",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    fetchBatchItems();

    // Set up real-time subscription for order_items
    const channel = supabase
      .channel('batch-view-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          fetchBatchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeBatches = batchItems.filter(item => item.status !== 'ready');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Batch Kitchen View</h1>
          <p className="text-muted-foreground mt-2">
            Group similar items for efficient preparation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {activeBatches.length} active batch{activeBatches.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {activeBatches.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No items to prepare</h3>
              <p className="text-sm text-muted-foreground">All current orders are ready!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeBatches.map((item) => (
            <Card key={item.menu_item_id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {item.name} × {item.total_quantity}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Category: {item.category || 'Uncategorized'}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(item.status)} variant="outline">
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Contributing Orders:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(item.order_ids)].map((orderId) => (
                        <Badge key={orderId} variant="secondary" className="text-xs">
                          {orderId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => markItemReady(item.menu_item_id, item.name)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={item.status === 'ready'}
                    >
                      Mark All as Ready
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}