import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { IndianRupee, Clock, CheckCircle, DollarSign, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatsCard } from '@/components/ui/stats-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface OrdersViewProps {
  restaurant: any;
}

export function OrdersView({ restaurant }: OrdersViewProps) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast.success('Orders refreshed');
  };

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

  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? orders.reduce((sum, order) => sum + order.total_amount, 0) / totalOrders : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Orders" 
          description="View and manage your restaurant orders"
        />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Orders" 
          description="View and manage your restaurant orders"
        />
        <Card className="p-8 bg-card">
          <EmptyState
            icon="⚠️"
            title="Error Loading Orders"
            description={error}
            action={{
              label: "Try Again",
              onClick: fetchOrders,
              variant: "default"
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Orders" 
        description="View and manage your restaurant orders"
      >
        <Button 
          onClick={handleRefresh} 
          variant="secondary" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          description="From completed orders"
          icon={<IndianRupee className="h-5 w-5 text-green-500" />}
          trend={{
            value: 12,
            isPositive: true,
            label: "vs yesterday"
          }}
        />
        
        <StatsCard
          title="Pending Orders"
          value={pendingOrders}
          description="Awaiting preparation"
          icon={<Clock className="h-5 w-5 text-[hsl(var(--primary))]" />}
        />
        
        <StatsCard
          title="Completed Today"
          value={completedToday}
          description="Orders fulfilled"
          icon={<CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />}
        />
        
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(averageOrderValue)}
          description="Per order"
          icon={<TrendingUp className="h-5 w-5 text-[hsl(var(--secondary))]" />}
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="border-0 shadow-md bg-card">
            <EmptyState
              icon={<Package className="h-8 w-8 text-muted-foreground" />}
              title="No Orders Yet"
              description="Orders will appear here once customers start placing them"
            />
          </Card>
        ) : (
          orders.map((order: any) => (
            <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] px-2 py-1 rounded text-sm font-mono">
                        #{order.order_id}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge 
                      status={order.order_status} 
                      type="order" 
                      size="sm"
                    />
                    <StatusBadge 
                      status={order.payment_status} 
                      type="payment" 
                      size="sm"
                    />
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
                        <span className="font-semibold text-[hsl(var(--primary))]">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="text-xl font-bold text-[hsl(var(--primary))]">
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