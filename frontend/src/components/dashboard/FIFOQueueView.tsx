import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Users, 
  TrendingUp, 
  RefreshCw,
  UserCheck,
  DollarSign,
  Hash
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface FIFOOrder {
  order_id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  queue_position: number;
  priority: number;
  created_at: string;
  status: string;
  estimated_wait_time: number;
}

interface FIFOQueueViewProps {
  restaurant: any;
}

export function FIFOQueueView({ restaurant }: FIFOQueueViewProps) {
  const [orders, setOrders] = useState<FIFOOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFIFOQueue();
    
    // Refresh every 30 seconds to keep queue updated
    const interval = setInterval(fetchFIFOQueue, 30000);
    return () => clearInterval(interval);
  }, [restaurant.id]);

  const fetchFIFOQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/functions/v1/cash-payment/fifo-queue/${restaurant.id}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch queue');
      }
      
      setOrders(result.data || []);
    } catch (err: any) {
      console.error('Error fetching FIFO queue:', err);
      setError(err.message || 'Failed to load order queue');
      toast.error('Failed to load order queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFIFOQueue();
    setRefreshing(false);
    toast.success('Queue refreshed');
  };

  const moveOrderInQueue = async (orderId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/functions/v1/cash-payment/move-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          order_id: orderId
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to move order');
      }
      
      toast.success('Order moved successfully');
      await fetchFIFOQueue(); // Refresh the queue
    } catch (err: any) {
      console.error('Error moving order:', err);
      toast.error(err.message || 'Failed to move order');
    }
  };

  const getQueueStats = () => {
    const totalOrders = orders.length;
    const avgWaitTime = totalOrders > 0 
      ? Math.round(orders.reduce((sum, order) => sum + order.estimated_wait_time, 0) / totalOrders)
      : 0;
    const highPriorityOrders = orders.filter(order => order.priority > 0).length;
    
    return { totalOrders, avgWaitTime, highPriorityOrders };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="FIFO Order Queue" 
          description="Manage order priority and queue positions"
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
          title="FIFO Order Queue" 
          description="Manage order priority and queue positions"
        />
        <Card className="p-8 bg-card">
          <EmptyState
            icon="⚠️"
            title="Error Loading Queue"
            description={error}
            action={{
              label: "Try Again",
              onClick: fetchFIFOQueue,
              variant: "default"
            }}
          />
        </Card>
      </div>
    );
  }

  const stats = getQueueStats();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="FIFO Order Queue" 
        description="Manage order priority and queue positions - First In, First Out"
      >
        <Button 
          onClick={handleRefresh} 
          variant="secondary" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Queue'}
        </Button>
      </PageHeader>

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[hsl(var(--primary))]/10 rounded-full p-3">
                <Hash className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[hsl(var(--success))]/10 rounded-full p-3">
                <Clock className="h-6 w-6 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgWaitTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[hsl(var(--secondary))]/10 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-[hsl(var(--secondary))]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-foreground">{stats.highPriorityOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Instructions */}
      <Card className="border-0 shadow-md bg-[hsl(var(--primary))]/5 bg-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="bg-[hsl(var(--primary))]/10 rounded-full p-2 mt-1">
              <Users className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Queue Management Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Orders are processed in <strong>First In, First Out (FIFO)</strong> order</li>
                <li>• High priority orders (VIP, urgent) can be moved up in the queue</li>
                <li>• Use the arrow buttons to adjust order positions when necessary</li>
                <li>• Queue refreshes automatically every 30 seconds</li>
                <li>• Estimated wait times are calculated based on queue position</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Order Queue</h2>
          <div className="text-sm text-muted-foreground">
            Showing {orders.length} orders in queue
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="border-0 shadow-md bg-card">
            <EmptyState
              icon={<Clock className="h-8 w-8 text-muted-foreground" />}
              title="No Orders in Queue"
              description="All orders have been processed or there are no pending orders"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <Card key={order.order_id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Queue Position */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="bg-[hsl(var(--primary))] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                          {order.queue_position}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Position</p>
                      </div>
                      
                      {/* Order Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">
                            Order #{order.order_number}
                          </h3>
                          {order.priority > 0 && (
                            <Badge variant="secondary" className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Priority {order.priority}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {order.customer_name}
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
                          <StatusBadge status={order.status} type="order" size="sm" />
                          <span className="text-xs text-muted-foreground">
                            Est. wait: {order.estimated_wait_time} minutes
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Queue Controls */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveOrderInQueue(order.order_id, 'up')}
                        disabled={order.queue_position === 1}
                        className="h-8 w-8 p-0 border-border hover:bg-muted"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveOrderInQueue(order.order_id, 'down')}
                        disabled={order.queue_position === orders.length}
                        className="h-8 w-8 p-0 border-border hover:bg-muted"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
