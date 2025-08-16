import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Clock, ChefHat, List, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { BatchView } from './BatchView';

interface KitchenViewProps {
  restaurant: any;
}

export function KitchenView({ restaurant }: KitchenViewProps) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          fetchPendingOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  const fetchPendingOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (name, price)
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .in('order_status', ['received', 'preparing'])
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to fetch orders');
    } else {
      setPendingOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order marked as ${newStatus}`);
      fetchPendingOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'paid' 
      ? 'bg-success text-success-foreground'
      : 'bg-orange-100 text-orange-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const OrderQueueView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Queue</h1>
          <p className="text-muted-foreground">Individual order management</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Active Orders</p>
          <p className="text-2xl font-bold text-primary">{pendingOrders.length}</p>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <List className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No pending orders</p>
            <p className="text-sm text-muted-foreground">New orders will appear here automatically</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingOrders.map((order: any) => (
            <Card key={order.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">#{order.order_id}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(order.order_status)}>
                      {order.order_status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Customer Info */}
                {(order.customer_name || order.customer_phone) && (
                  <div className="text-sm space-y-1">
                    {order.customer_name && (
                      <p><strong>Customer:</strong> {order.customer_name}</p>
                    )}
                    {order.customer_phone && (
                      <p><strong>Phone:</strong> {order.customer_phone}</p>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Items:</h4>
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="bg-muted p-2 rounded text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {item.quantity}x {item.menu_items.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {order.order_status === 'received' && (
                    <Button 
                      className="w-full" 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      Start Preparing
                    </Button>
                  )}
                  
                  {order.order_status === 'preparing' && (
                    <Button 
                      className="w-full"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                    >
                      Mark as Ready
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            Kitchen Dashboard
          </h1>
          <p className="text-muted-foreground">Manage orders and batch preparation</p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Order Queue
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Batch View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <OrderQueueView />
        </TabsContent>
        
        <TabsContent value="batch" className="mt-6">
          <BatchView restaurant={restaurant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}