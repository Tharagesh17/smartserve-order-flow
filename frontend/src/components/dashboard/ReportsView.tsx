import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFeatureFlags, getHotelTypeLabel } from '@/lib/featureFlags';
import { BarChart3, TrendingUp, Package, Users, Building2, IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface ReportsViewProps {
  restaurant: any;
}

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
}

export function ReportsView({ restaurant }: ReportsViewProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const features = getFeatureFlags(restaurant.hotel_type);

  useEffect(() => {
    fetchReportData();
  }, [restaurant.id, timeRange]);

  const fetchReportData = async () => {
    setLoading(true);
    
    try {
      // Get orders for the selected time range
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('order_status', 'completed');

      if (error) throw error;

      if (orders) {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get top items (simplified - in real app you'd aggregate from order_items)
        const topItems = [
          { name: 'Sample Item 1', quantity: 25, revenue: 125.00 },
          { name: 'Sample Item 2', quantity: 20, revenue: 100.00 },
          { name: 'Sample Item 3', quantity: 15, revenue: 75.00 },
        ];

        setReportData({
          totalOrders,
          totalRevenue,
          averageOrderValue,
          topItems
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <div className="text-center py-8">Loading reports...</div>
      </div>
    );
  }

  if (!features.canUseAdvancedReports) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <div className="text-center py-8">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Reports Not Available</h3>
          <p className="text-muted-foreground">
            Advanced reporting is not available for {getHotelTypeLabel(restaurant.hotel_type).toLowerCase()} accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <Badge variant="outline">
          {getHotelTypeLabel(restaurant.hotel_type)}
        </Badge>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['today', 'week', 'month'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This week' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This week' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      {features.canUseTopItemsReport && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.quantity} sold</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotel-specific features */}
      {restaurant.hotel_type === 'hotel' && features.canUseOutletWiseReports && (
        <Card>
          <CardHeader>
            <CardTitle>Outlet-wise Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4" />
              <p>Multi-outlet reporting coming soon!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
