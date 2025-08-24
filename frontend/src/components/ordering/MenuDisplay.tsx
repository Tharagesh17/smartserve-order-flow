import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/lib/currency';
import { Leaf, Star, QrCode, ChefHat, Clock, TrendingUp } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_vegetarian: boolean;
  is_popular: boolean;
  image_url?: string;
}

interface MenuDisplayProps {
  restaurant: any;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuDisplay({ restaurant, onAddToCart }: MenuDisplayProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, [restaurant.id]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) {
        console.error('Error fetching menu items:', error);
        toast.error('Failed to load menu');
      } else {
        setMenuItems(data || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const filterMatch = filter === 'all' || 
      (filter === 'veg' && item.is_vegetarian) ||
      (filter === 'non-veg' && !item.is_vegetarian);
    
    return categoryMatch && filterMatch;
  });

  const handleAddToCart = (item: MenuItem) => {
    onAddToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">{restaurant.name}</h1>
        <p className="text-muted-foreground mb-6">{restaurant.description || 'Delicious food, fast service'}</p>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4 border-0 shadow-md bg-card hover:shadow-lg transition-shadow">
            <div className="bg-[hsl(var(--primary))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="h-8 w-8 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Quick Ordering</h3>
            <p className="text-sm text-muted-foreground">Scan QR code to order instantly</p>
          </Card>
          
          <Card className="text-center p-4 border-0 shadow-md bg-card hover:shadow-lg transition-shadow">
            <div className="bg-[hsl(var(--success))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-8 w-8 text-[hsl(var(--success))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Fast Service</h3>
            <p className="text-sm text-muted-foreground">Orders prepared in minutes</p>
          </Card>
          
          <Card className="text-center p-4 border-0 shadow-md bg-card hover:shadow-lg transition-shadow">
            <div className="bg-[hsl(var(--secondary))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChefHat className="h-8 w-8 text-[hsl(var(--secondary))]" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Fresh Food</h3>
            <p className="text-sm text-muted-foreground">Made fresh every day</p>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Category Filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white border-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/90"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white border-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/90"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Dietary Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white border-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]/90"
          >
            All
          </Button>
          <Button
            variant={filter === 'veg' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('veg')}
            className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-white border-[hsl(var(--success))] hover:border-[hsl(var(--success))]/90"
          >
            <Leaf className="h-3 w-3 mr-1" />
            Vegetarian
          </Button>
          <Button
            variant={filter === 'non-veg' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('non-veg')}
            className="bg-[hsl(var(--secondary)] hover:bg-[hsl(var(--secondary))]/90 text-white border-[hsl(var(--secondary))] hover:border-[hsl(var(--secondary))]/90"
          >
            Non-Vegetarian
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                      {item.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  {item.is_popular && (
                    <Badge 
                      variant="secondary" 
                      className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30"
                    >
                      <Star className="h-3 w-3 mr-1 fill-[hsl(var(--primary))]" />
                      Popular
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[hsl(var(--primary))]">
                      {formatCurrency(item.price)}
                    </span>
                    {item.is_vegetarian && (
                      <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                        <Leaf className="h-2 w-2 mr-1" />
                        Veg
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(item)}
                    size="sm"
                    className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center py-8">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--success))]/10 bg-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ready to order?
            </h3>
            <p className="text-muted-foreground mb-4">
              Your delicious food is just a few clicks away
            </p>
            <Button 
              size="lg" 
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Start Ordering
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}