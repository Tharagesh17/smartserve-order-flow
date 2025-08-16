import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Leaf } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface MenuDisplayProps {
  menuItems: any[];
  onAddToCart: (item: any, quantity: number) => void;
}

export function MenuDisplay({ menuItems, onAddToCart }: MenuDisplayProps) {
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...new Set(menuItems.map(item => item.category).filter(Boolean))];
  
  const filteredItems = menuItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'veg') return item.is_veg;
    if (filter === 'non-veg') return !item.is_veg;
    return item.category === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Items
        </Button>
        <Button
          variant={filter === 'veg' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('veg')}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <Leaf className="h-3 w-3 mr-1" />
          Vegetarian
        </Button>
        <Button
          variant={filter === 'non-veg' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('non-veg')}
        >
          Non-Vegetarian
        </Button>
        {categories.filter(cat => cat !== 'all').map(category => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found for this filter</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {item.is_veg && (
                          <Badge variant="secondary" className="bg-success text-success-foreground">
                            <Leaf className="h-3 w-3 mr-1" />
                            Veg
                          </Badge>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(item.price)}
                        </span>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>

                      {item.allergy_tags && item.allergy_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.allergy_tags.map((tag: string) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-xs bg-orange-100 text-orange-800"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={() => onAddToCart(item, 1)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}