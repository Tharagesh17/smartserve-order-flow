import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  DollarSign, 
  UserCheck, 
  Clock, 
  Receipt, 
  CheckCircle, 
  RefreshCw,
  Search
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  can_authorize_payments: boolean;
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  cash_payment_received_at?: string;
}

interface CashPaymentViewProps {
  restaurant: any;
}

export function CashPaymentView({ restaurant }: CashPaymentViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    staff_id: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [restaurant.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      setOrders([
        {
          id: '1',
          order_id: 'ORD001',
          customer_name: 'John Doe',
          total_amount: 25.50,
          payment_status: 'pending',
          order_status: 'received',
          created_at: new Date().toISOString()
        }
      ]);
      
      setStaff([
        {
          id: '1',
          name: 'Manager',
          role: 'manager',
          can_authorize_payments: true
        }
      ]);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      toast.success('Cash payment processed successfully!');
      setSelectedOrder(null);
      setPaymentForm({ staff_id: '', amount: '', notes: '' });
      await fetchData();
    } catch (err: any) {
      toast.error('Failed to process payment');
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Cash Payment Management" 
          description="Process cash payments for hotel guests"
        />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Cash Payment Management" 
        description="Process cash payments for hotel guests"
      />

      {/* Search */}
      <Card className="border-0 shadow-md bg-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-md bg-card">
            <EmptyState
              icon={<Receipt className="h-8 w-8 text-muted-foreground" />}
              title="No Orders Found"
              description="Try adjusting your search"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">
                          Order #{order.order_id}
                        </h3>
                        <StatusBadge status={order.payment_status} type="payment" size="sm" />
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
                    </div>
                    
                    {order.payment_status === 'pending' && (
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        size="sm"
                        className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Process Cash
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cash Payment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-0 shadow-xl bg-card">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Process Cash Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Order Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Order: #{selectedOrder.order_id}</p>
                  <p>Customer: {selectedOrder.customer_name}</p>
                  <p>Total: {formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>
              
              <form onSubmit={handleProcessCashPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff" className="text-sm font-medium text-foreground">Staff Member</Label>
                  <Select 
                    value={paymentForm.staff_id} 
                    onValueChange={(value) => setPaymentForm(prev => ({ ...prev, staff_id: value }))}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-foreground">Amount Received</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min={selectedOrder.total_amount}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder={`${selectedOrder.total_amount}`}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-foreground">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    className="bg-background border-border text-foreground"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!paymentForm.staff_id || !paymentForm.amount}
                    className="flex-1 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
                  >
                    Process Payment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
