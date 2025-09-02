import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { ShoppingCart, X, Minus, Plus, Trash2, Clock, IndianRupee, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionService } from '@/lib/subscription';
import { formatCurrency } from '@/lib/currency';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant_name?: string;
  variant_price?: number;
  addons?: Array<{ name: string; price: number }>;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
  restaurantId: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onClearCart, restaurantId }: CartProps) {
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', paymentMethod: 'counter' });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (isOpen && !razorpayLoaded) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
        console.log('Razorpay SDK loaded');
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        toast.error('Payment system is temporarily unavailable');
      };
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen, razorpayLoaded]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!restaurantId) throw new Error('Restaurant ID is required');
      if (items.length === 0) throw new Error('Cart is empty');
      
      // Validate customer info for online payments
      if (customerInfo.paymentMethod === 'online') {
        if (!customerInfo.name.trim()) throw new Error('Name is required for online payment');
        if (!customerInfo.phone.trim()) throw new Error('Phone number is required for online payment');
      }

      const orderId = `ORD${Date.now()}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_id: orderId,
            restaurant_id: restaurantId,
            total_amount: total,
            payment_method: customerInfo.paymentMethod,
            payment_status: 'pending',
            order_status: 'received',
            customer_name: customerInfo.name || null,
            customer_phone: customerInfo.phone || null,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map((item) => ({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          status: 'pending',
        }))
      );
      
      if (itemsError) throw itemsError;

      // Increment user's order count for subscription tracking
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await subscriptionService.incrementUserOrderCount(user.id, restaurantId);
        }
      } catch (error) {
        console.error('Error incrementing order count:', error);
        // Don't fail the order if this fails
      }

      // For online payments, initiate Razorpay
      if (customerInfo.paymentMethod === 'online') {
        if (!razorpayLoaded) {
          throw new Error('Payment system is still loading. Please try again in a moment.');
        }

        if (!window.Razorpay) {
          throw new Error('Payment system is unavailable. Please try counter payment.');
        }

        const { data, error: razorpayError } = await supabase.functions.invoke("payments-razorpay", {
          body: {
            action: "create_order",
            amount: Math.round(total * 100), // Razorpay needs paise
            currency: "INR",
            receipt: orderId,
            db_order_id: order.id,
            notes: {
              customer_name: customerInfo.name,
              customer_phone: customerInfo.phone
            }
          }
        });

        if (razorpayError) throw razorpayError;

        const { key_id, order: razorpayOrder } = data;
        
        const options = {
          key: key_id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'SmartServe',
          description: `Order ${orderId}`,
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            try {
              const { error: verifyError } = await supabase.functions.invoke("payments-razorpay", {
                body: {
                  action: "verify_payment",
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  db_order_id: order.id,
                  amount: Math.round(total * 100)
                }
              });
              
              if (verifyError) throw verifyError;
              
              toast.success('Payment successful! Order placed.');
              onClose();
              onClearCart();
            } catch (error: any) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed: ' + (error.message || 'Unknown error'));
            }
          },
          prefill: {
            name: customerInfo.name,
            contact: customerInfo.phone,
            email: '' // Razorpay expects email field
          },
          theme: { color: '#40E0D0' },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled');
              // Update order status to reflect cancelled payment
              supabase
                .from('orders')
                .update({ payment_status: 'failed', order_status: 'cancelled' })
                .eq('id', order.id)
                .then(() => console.log('Order marked as cancelled'));
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // For counter payments
        toast.success('Order placed successfully! Please pay at the counter.');
        onClose();
        onClearCart();
      }
    } catch (err: any) {
      console.error('Order error:', err);
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500">Start adding items to place an order</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <form onSubmit={handleSubmitOrder} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required={customerInfo.paymentMethod === 'online'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required={customerInfo.paymentMethod === 'online'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select
                      value={customerInfo.paymentMethod}
                      onValueChange={(value) => handleInputChange('paymentMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="counter">Pay at Counter</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || (customerInfo.paymentMethod === 'online' && !razorpayLoaded)}
                  >
                    {loading ? 'Processing...' : `Place Order - ${formatCurrency(total)}`}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}