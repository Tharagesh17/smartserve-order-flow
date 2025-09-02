import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionService } from '@/lib/subscription';
import { MenuDisplay } from '@/components/ordering/MenuDisplay';
import { Cart } from '@/components/ordering/Cart';
import { RestaurantHeader } from '@/components/ordering/RestaurantHeader';
import { OrderSuccess } from '@/components/ordering/OrderSuccess';
import { toast } from 'react-hot-toast';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

export default function OrderingPage() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [orderLimit, setOrderLimit] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant details
      // Use the secure public view that excludes sensitive contact information
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants_public')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError || !restaurantData) {
        toast.error('Restaurant not found or inactive');
        return;
      }

      setRestaurant(restaurantData);

      // Check if restaurant requires subscription
      if (restaurantData.subscription_required) {
        // Get current user's order count and subscription status
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const canPlaceOrder = await subscriptionService.canPlaceOrder(user.id, restaurantId);
          setSubscriptionStatus(canPlaceOrder);
          
          if (!canPlaceOrder.canPlace) {
            setOrderLimit(canPlaceOrder);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (menuItem, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...menuItem, quantity }];
    });
    toast.success(`${menuItem.name} added to cart`);
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Restaurant Not Found</h1>
          <p className="text-muted-foreground">This restaurant may be inactive or the link is invalid.</p>
        </div>
      </div>
    );
  }

  // Show subscription limit warning
  if (orderLimit && !orderLimit.canPlace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Order Limit Reached</h1>
            <p className="text-muted-foreground mb-4">
              You've reached your free order limit of {orderLimit.limit} orders for this restaurant.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">Current Usage:</p>
              <div className="flex justify-between items-center">
                <span className="text-sm">Orders placed:</span>
                <span className="font-semibold">{orderLimit.orderCount} / {orderLimit.limit}</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Subscribe to continue placing orders with unlimited access.
              </p>
              <button
                onClick={() => window.location.href = '/subscription'}
                className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:bg-primary/90 transition-colors"
              >
                View Subscription Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <OrderSuccess 
        order={orderSuccess} 
        restaurant={restaurant}
        onNewOrder={() => {
          setOrderSuccess(null);
          clearCart();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RestaurantHeader restaurant={restaurant} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <MenuDisplay 
          restaurant={restaurant} 
          onAddToCart={addToCart}
        />
      </div>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onClearCart={clearCart}
        restaurantId={restaurantId}
      />
    </div>
  );
}