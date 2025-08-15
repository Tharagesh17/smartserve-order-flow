import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MenuDisplay } from '@/components/ordering/MenuDisplay';
import { Cart } from '@/components/ordering/Cart';
import { RestaurantHeader } from '@/components/ordering/RestaurantHeader';
import { OrderSuccess } from '@/components/ordering/OrderSuccess';
import { toast } from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';

export default function OrderingPage() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant details
    // Fetch restaurant data without sensitive contact information for public users
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, location, is_active, qr_code_url, ordering_url, created_at, updated_at')
      .eq('id', restaurantId)
      .eq('is_active', true)
      .single();

      if (restaurantError || !restaurantData) {
        toast.error('Restaurant not found or inactive');
        return;
      }

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (menuError) {
        toast.error('Failed to load menu');
        return;
      }

      setRestaurant(restaurantData);
      setMenuItems(menuData || []);
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
          menuItems={menuItems} 
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
        total={getCartTotal()}
        restaurant={restaurant}
        onOrderSuccess={setOrderSuccess}
      />
    </div>
  );
}