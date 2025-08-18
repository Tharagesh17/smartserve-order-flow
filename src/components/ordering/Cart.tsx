import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { Minus, Plus, Trash2, X, ShoppingCart, CreditCard, IndianRupee, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onClearCart: () => void;
  total: number;
  restaurant: any;
  onOrderSuccess: (order: any) => void;
}

export function Cart({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onClearCart, 
  total, 
  restaurant,
  onOrderSuccess 
}: CartProps) {
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    paymentMethod: 'counter'
  });

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);

    // Dynamically load Razorpay SDK when needed
    const loadRazorpay = () => new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay SDK load failed'));
      document.body.appendChild(script);
    });

    try {
      // Generate order ID
      const { data: orderIdData, error: orderIdError } = await supabase
        .rpc('generate_order_id');

      if (orderIdError) throw orderIdError;

      // Create order
      const orderData = {
        order_id: orderIdData,
        restaurant_id: restaurant.id,
        total_amount: total,
        customer_name: customerInfo.name || null,
        customer_phone: customerInfo.phone || null,
        payment_method: customerInfo.paymentMethod,
        payment_status: customerInfo.paymentMethod === 'counter' ? 'pending' : 'pending',
        order_status: 'received'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // If not paying online, we finish here
      if (customerInfo.paymentMethod !== 'online') {
        toast.success('Order placed successfully!');
        onOrderSuccess({ ...order, order_items: orderItems });
        onClose();
        return;
      }

      // Online payment path using Razorpay
      await loadRazorpay();

      const amountPaise = Math.round(total * 100);

      const { data: createResp, error: funcCreateErr } = await (supabase as any).functions.invoke('payments-razorpay', {
        body: {
          action: 'create_order',
          amount: amountPaise,
          currency: 'INR',
          receipt: order.order_id,
          db_order_id: order.id,
          notes: { restaurant_id: restaurant.id }
        }
      });

      if (funcCreateErr || !(createResp?.order?.id) || !(createResp?.key_id)) {
        throw new Error((funcCreateErr as any)?.message || 'Failed to initialize payment');
      }

      const key_id = createResp.key_id;
      const rzpOrder = createResp.order;

      const anyWindow = window as any;
      const rzp = new anyWindow.Razorpay({
        key: key_id,
        amount: amountPaise,
        currency: 'INR',
        name: restaurant?.name || 'Order Payment',
        description: `Order ${order.order_id}`,
        order_id: rzpOrder.id,
        prefill: {
          name: customerInfo.name || '',
          contact: customerInfo.phone || ''
        },
        handler: async (response: any) => {
          try {
            const { data: verifyResp, error: funcVerifyErr } = await (supabase as any).functions.invoke('payments-razorpay', {
              body: {
                action: 'verify_payment',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: order.id,
                amount: amountPaise
              }
            });

            if (funcVerifyErr || (verifyResp as any)?.error) {
              throw new Error((funcVerifyErr as any)?.message || (verifyResp as any)?.error || 'Verification failed');
            }

            toast.success('Payment successful!');

            // Fetch updated order to reflect payment status
            const { data: updatedOrder, error: fetchErr } = await supabase
              .from('orders')
              .select('*')
              .eq('id', order.id)
              .single();

            if (fetchErr) throw fetchErr;

            onOrderSuccess({ ...updatedOrder, order_items: orderItems });
            onClose();
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast.error('Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled');
          }
        },
        theme: { color: '#0ea5e9' }
      });

      rzp.open();

    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-xl">Your Order</SheetTitle>
                <p className="text-sm text-muted-foreground">{items.length} items</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-6">
            <div className="bg-muted rounded-full p-4 mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add some delicious items to get started
            </p>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Item Image Placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🍽️</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatCurrency(item.price)} each
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, 0)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total */}
              <Card className="border-0 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Information */}
            <div className="p-6 border-t bg-muted/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Customer Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Name (Optional)</Label>
                  <Input
                    id="customer-name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Phone (Optional)</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your phone number"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select 
                    value={customerInfo.paymentMethod}
                    onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counter" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pay at Counter
                      </SelectItem>
                      <SelectItem value="online" className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Pay Online
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t bg-background">
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Placing Order...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Place Order
                    </div>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={onClearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}