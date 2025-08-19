import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { IndianRupee, Clock, CheckCircle, DollarSign, Package, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface OrdersViewProps {
  restaurant: any;
}

export function OrdersView({ restaurant }: OrdersViewProps) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name)
          )
        `)
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again.');
        toast.error('Failed to fetch orders');
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please refresh the page.');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground">View and manage your restaurant orders</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
            <p className="text-muted-foreground">View and manage your restaurant orders</p>
          </div>
        </div>
        <Card className="p-8">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchOrders}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate summary stats
  const todayRevenue = orders
    .filter(order => 
      new Date(order.created_at).toDateString() === new Date().toDateString() &&
      order.payment_status === 'paid'
    )
    .reduce((sum, order) => sum + order.total_amount, 0);

  const pendingOrders = orders.filter(order => 
    order.order_status === 'received' || order.order_status === 'preparing'
  ).length;

  const completedToday = orders.filter(order => 
    new Date(order.created_at).toDateString() === new Date().toDateString() &&
    order.order_status === 'completed'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">View and manage your restaurant orders</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <Package className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(todayRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {completedToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground text-center">
                Orders will appear here once customers start placing them
              </p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order: any) => (
            <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono">
                        #{order.order_id}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getStatusColor(order.order_status)} border`}>
                      {order.order_status}
                    </Badge>
                    <Badge className={`${getPaymentStatusColor(order.payment_status)} border`}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Info */}
                  {(order.customer_name || order.customer_phone) && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Customer Information</h4>
                      <div className="flex gap-4 text-sm">
                        {order.customer_name && (
                          <span><strong>Name:</strong> {order.customer_name}</span>
                        )}
                        {order.customer_phone && (
                          <span><strong>Phone:</strong> {order.customer_phone}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Order Items:</h4>
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm bg-muted/30 p-3 rounded-lg">
                        <span className="font-medium">
                          {item.quantity}x {item.menu_items.name}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}