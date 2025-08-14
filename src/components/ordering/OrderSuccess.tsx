import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';

interface OrderSuccessProps {
  order: any;
  restaurant: any;
  onNewOrder: () => void;
}

export function OrderSuccess({ order, restaurant, onNewOrder }: OrderSuccessProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-success rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-success-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-success">Order Placed Successfully!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Order #{order.order_id}</h3>
              <p className="text-muted-foreground">{restaurant.name}</p>
            </div>

            {/* Status */}
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Clock className="h-3 w-3 mr-1" />
                {order.order_status}
              </Badge>
              <Badge variant="secondary" className={
                order.payment_status === 'paid' 
                  ? 'bg-success text-success-foreground'
                  : 'bg-orange-100 text-orange-800'
              }>
                <DollarSign className="h-3 w-3 mr-1" />
                {order.payment_status}
              </Badge>
            </div>

            {/* Total */}
            <div className="text-center">
              <p className="text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                ${order.total_amount.toFixed(2)}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">What's Next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your order is being prepared</li>
                <li>• You'll be notified when it's ready</li>
                {order.payment_method === 'counter' && (
                  <li>• Please pay at the counter when collecting</li>
                )}
                <li>• Order ID: {order.order_id}</li>
              </ul>
            </div>

            {/* Customer Info */}
            {(order.customer_name || order.customer_phone) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Contact Information</h4>
                {order.customer_name && (
                  <p className="text-sm text-muted-foreground">Name: {order.customer_name}</p>
                )}
                {order.customer_phone && (
                  <p className="text-sm text-muted-foreground">Phone: {order.customer_phone}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={onNewOrder} className="w-full">
                Place Another Order
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.close()}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}