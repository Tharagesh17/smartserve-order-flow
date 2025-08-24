import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  IndianRupee, 
  Clock, 
  DollarSign, 
  Package, 
  TrendingUp, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Hash,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatsCard } from '@/components/ui/stats-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  queue_position?: number;
  order_priority?: number;
  estimated_wait_time?: number;
  order_items?: Array<{
    id: string;
    quantity: number;
    menu_items: {
      name: string;
    };
  }>;
}

interface OrdersViewProps {
  restaurant: any;
}

export function OrdersView({ restaurant }: OrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'ready' | 'completed'>('pending');

  useEffect(() => {
    fetchOrders();

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
        const transformedOrders = (data || []).map((order: any, index) => ({
          ...order,
          queue_position: order.queue_position || index + 1,
          order_priority: order.order_priority || 0,
          estimated_wait_time: (order.queue_position || index + 1) * 15
        }));

        setOrders(transformedOrders);
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

  const moveOrderInQueue = async (orderId: string, direction: 'up' | 'down') => {
    try {
      toast('Queue reordering feature coming soon!');
      await fetchOrders();
    } catch (err: any) {
      console.error('Error moving order:', err);
      toast.error(err.message || 'Failed to move order');
    }
  };

  const pendingOrders = orders.filter(order => 
    order.order_status === 'received' && order.payment_status !== 'paid'
  );

  const readyOrders = orders.filter(order => 
    order.order_status === 'preparing' || order.order_status === 'ready'
  );

  const completedOrders = orders.filter(order => 
    order.order_status === 'completed'
  );

  const todayRevenue = orders
    .filter(order => 
      new Date(order.created_at).toDateString() === new Date().toDateString() &&
      order.payment_status === 'paid'
    )
    .reduce((sum, order) => sum + order.total_amount, 0);

  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? orders.reduce((sum, order) => sum + order.total_amount, 0) / totalOrders : 0;
  const avgWaitTime = orders.length > 0 
    ? Math.round(orders.reduce((sum, order) => sum + (order.estimated_wait_time || 0), 0) / orders.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Orders & Queue" 
          description="View and manage your restaurant orders and queue"
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
          title="Orders & Queue" 
          description="View and manage your restaurant orders and queue"
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
        title="Orders & Queue" 
        description="View and manage your restaurant orders and queue"
      >
        {/* Collapsible wrapper: header row + content */}
        <Collapsible open={showMetrics} onOpenChange={setShowMetrics}>
          {/* Header row: buttons side by side, aligned to right */}
          <div className="flex items-center gap-2 justify-end">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Metrics
                {showMetrics ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </CollapsibleTrigger>

            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Expanded metrics below */}
          <CollapsibleContent className="mt-2">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <StatsCard
                title="Today's Revenue"
                value={formatCurrency(todayRevenue)}
                description="From completed orders"
                icon={<IndianRupee className="h-5 w-5 text-green-500" />}
              />

              <StatsCard
                title="Total Orders"
                value={totalOrders}
                description="All time"
                icon={<Hash className="h-5 w-5 text-[hsl(var(--primary))]" />}
              />

              <StatsCard
                title="Avg Order Value"
                value={formatCurrency(averageOrderValue)}
                description="Per order"
                icon={<TrendingUp className="h-5 w-5 text-[hsl(var(--secondary))]" />}
              />

              <StatsCard
                title="Avg Wait Time"
                value={`${avgWaitTime} min`}
                description="Estimated"
                icon={<Clock className="h-5 w-5 text-[hsl(var(--success))]" />}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </PageHeader>

      {/* Order Status Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('pending')}
          className="relative"
        >
          Pending
          {pendingOrders.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 min-w-[20px] h-5 px-1 text-xs flex items-center justify-center rounded-full"
            >
              {pendingOrders.length}
            </Badge>
          )}
        </Button>

        <Button
          variant={activeTab === 'ready' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('ready')}
          className="relative"
        >
          Ready
          {readyOrders.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 min-w-[20px] h-5 px-1 text-xs flex items-center justify-center rounded-full"
            >
              {readyOrders.length}
            </Badge>
          )}
        </Button>

        <Button
          variant={activeTab === 'completed' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('completed')}
          className="relative"
        >
          Completed
          {completedOrders.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 min-w-[20px] h-5 px-1 text-xs flex items-center justify-center rounded-full"
            >
              {completedOrders.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {(() => {
          const currentOrders = activeTab === 'pending' ? pendingOrders : 
                               activeTab === 'ready' ? readyOrders : completedOrders;
          
          if (currentOrders.length === 0) {
            return (
              <Card className="border-0 shadow-md bg-card">
                <EmptyState
                  icon={<Package className="h-8 w-8 text-muted-foreground" />}
                  title={`No ${activeTab} orders`}
                  description={`No orders are currently ${activeTab}`}
                />
              </Card>
            );
          }

          return (
            <div className="space-y-3">
              {currentOrders.map((order) => (
                <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {activeTab === 'pending' && (
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="bg-[hsl(var(--primary))] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                              {order.queue_position}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Position</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-2 ml-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">
                            Order #{order.order_id}
                          </h3>
                          {order.order_priority && order.order_priority > 0 && (
                            <Badge variant="secondary" className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Priority {order.order_priority}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {order.customer_name || 'Walk-in Customer'}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(order.total_amount)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.order_status} type="order" size="sm" />
                          <StatusBadge status={order.payment_status} type="payment" size="sm" />
                          {activeTab === 'pending' && order.estimated_wait_time && (
                            <span className="text-xs text-muted-foreground">
                              Est. wait: {order.estimated_wait_time} minutes
                            </span>
                          )}
                        </div>
                        
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Items:</span> {order.order_items.map(item => 
                              `${item.quantity}x ${item.menu_items?.name}`
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                      
                      {activeTab === 'pending' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveOrderInQueue(order.id, 'up')}
                            disabled={order.queue_position === 1}
                            className="h-8 w-8 p-0 border-border hover:bg-muted"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveOrderInQueue(order.id, 'down')}
                            disabled={order.queue_position === pendingOrders.length}
                            className="h-8 w-8 p-0 border-border hover:bg-muted"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
