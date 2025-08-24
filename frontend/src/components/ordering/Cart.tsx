import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCart, 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  Clock, 
  IndianRupee, 
  CreditCard,
  DollarSign
} from 'lucide-react';
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
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onClearCart }: CartProps) {
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    paymentMethod: 'counter'
  });

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (customerInfo.paymentMethod === 'online') {
        // Initialize Razorpay payment
        try {
          const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
            amount: total * 100, // Razorpay expects amount in paise
            currency: 'INR',
            name: 'SmartServe',
            description: 'Restaurant Order',
            theme: {
              color: '#40E0D0' // Using our primary blue color
            },
            handler: function (response: any) {
              toast.success('Payment successful! Order placed.');
              onClose();
              onClearCart();
            },
            prefill: {
              name: customerInfo.name || 'Customer',
              contact: customerInfo.phone || ''
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (onlineErr: any) {
          console.error('Online payment error:', onlineErr);
          toast.error(onlineErr?.message || 'Could not start payment.');
        }
        return;
      } else if (customerInfo.paymentMethod === 'cash') {
        // For cash payments, just place the order
        toast.success('Order placed successfully! Please pay at the counter.');
        onClose();
        onClearCart();
        return;
      } else {
        // Counter payment
        toast.success('Order placed successfully! Please pay at the counter.');
        onClose();
        onClearCart();
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-background">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[hsl(var(--primary))] rounded-full p-2">
                <ShoppingCart className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
              </div>
              <div>
                <SheetTitle className="text-xl text-foreground">Your Order</SheetTitle>
                <p className="text-sm text-muted-foreground">{items.length} items</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
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
            <h3 className="text-lg font-semibold mb-2 text-foreground">Your cart is empty</h3>
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
                <Card key={item.id} className="border-0 shadow-sm bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Item Image Placeholder */}
                      <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--primary))]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🍽️</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-foreground">{item.name}</h4>
                        {item.variant_name && (
                          <p className="text-xs text-muted-foreground">Variant: {item.variant_name} ({formatCurrency(item.variant_price || 0)})</p>
                        )}
                        {Array.isArray(item.addons) && item.addons.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Add-ons: {item.addons.map((a: any) => `${a.name} (${formatCurrency(a.price || 0)})`).join(', ')}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mb-2 mt-1">
                          {formatCurrency(item.price)} each
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 border-border hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 border-border hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, 0)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-sm text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total */}
              <Card className="border-0 bg-[hsl(var(--primary))]/5 bg-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total:</span>
                    <span className="text-2xl font-bold text-[hsl(var(--primary))]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Information */}
            <div className="p-6 border-t border-border bg-muted/30">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <IndianRupee className="h-4 w-4" />
                Customer Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name" className="text-sm font-medium text-foreground">Name (Optional)</Label>
                  <Input
                    id="customer-name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-phone" className="text-sm font-medium text-foreground">Phone (Optional)</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your phone number"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method" className="text-sm font-medium text-foreground">Payment Method</Label>
                  <Select 
                    value={customerInfo.paymentMethod}
                    onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counter" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pay at Counter
                      </SelectItem>
                      <SelectItem value="cash" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Pay with Cash
                      </SelectItem>
                      <SelectItem value="online" className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Pay Online
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {customerInfo.paymentMethod === 'cash' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Tip: Hotel staff will process your cash payment at the counter
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-border bg-background">
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90" 
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
                  variant="subtle"
                  className="w-full bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 text-[hsl(var(--secondary-foreground))]" 
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