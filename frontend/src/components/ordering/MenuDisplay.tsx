import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Leaf, Clock, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface MenuDisplayProps {
  menuItems: any[];
  onAddToCart: (item: any, quantity: number) => void;
}

export function MenuDisplay({ menuItems, onAddToCart }: MenuDisplayProps) {
  const [filter, setFilter] = useState('all');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string | null>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Set<string>>>({});

  const categories = ['all', ...new Set(menuItems.map(item => item.category).filter(Boolean))];
  
  const filteredItems = menuItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'veg') return item.is_veg;
    if (filter === 'non-veg') return !item.is_veg;
    return item.category === filter;
  });

  return (
    <div className="space-y-8">
      {/* Enhanced Filters */}
      <div className="bg-card rounded-lg p-4 border shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="transition-all duration-200"
          >
            All Items
          </Button>
          <Button
            variant={filter === 'veg' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('veg')}
            className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
          >
            <Leaf className="h-3 w-3 mr-1" />
            Vegetarian
          </Button>
          <Button
            variant={filter === 'non-veg' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('non-veg')}
            className="transition-all duration-200"
          >
            Non-Vegetarian
          </Button>
          {categories.filter(cat => cat !== 'all').map(category => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(category)}
              className="capitalize transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more options</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const variants = (item.menu_item_prices || []) as Array<{ id: string; size: string; price: number }>;
            const addons = (item.menu_item_addons || []) as Array<{ id: string; name: string; price: number }>;
            const selectedVariantId = selectedVariants[item.id] || (variants[0]?.id ?? null);
            const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
            const addonSet = selectedAddons[item.id] || new Set<string>();
            const addonList = addons.filter(a => addonSet.has(a.id));
            const computedPrice = (selectedVariant?.price || item.price || 0) + addonList.reduce((s, a) => s + (a.price || 0), 0);
            return (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md">
              <CardContent className="p-0">
                {/* Item Image Placeholder */}
                {item.image_url ? (
                  <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="text-4xl opacity-50">🍽️</div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        {item.is_veg && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <Leaf className="h-3 w-3 mr-1" />
                            Veg
                          </Badge>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(computedPrice)}
                      </span>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Popular Badge */}
                    {Math.random() > 0.7 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                        <Star className="h-3 w-3 mr-1 fill-orange-400" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Variants */}
                  {variants.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Choose size</div>
                      <Select value={selectedVariantId || ''} onValueChange={(v) => {
                        setSelectedVariants(prev => ({ ...prev, [item.id]: v }));
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.size} - {formatCurrency(v.price)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Add-ons */}
                  {addons.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-muted-foreground mb-2">Add-ons</div>
                      <div className="space-y-2">
                        {addons.map(a => {
                          const checked = (selectedAddons[item.id] || new Set()).has(a.id);
                          return (
                            <label key={a.id} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  setSelectedAddons(prev => {
                                    const curr = new Set(prev[item.id] || []);
                                    if (v) { curr.add(a.id); } else { curr.delete(a.id); }
                                    return { ...prev, [item.id]: curr };
                                  });
                                }}
                              />
                              <span>{a.name} ({formatCurrency(a.price)})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Preparation Time */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>15-20 min</span>
                  </div>

                  {/* Allergy Tags */}
                  {item.allergy_tags && item.allergy_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.allergy_tags.map((tag: string) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs bg-red-50 text-red-700 border-red-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button 
                    onClick={() => {
                      const selectedVariantFinal = variants.find(v => v.id === (selectedVariants[item.id] || variants[0]?.id));
                      const addonIds = Array.from(selectedAddons[item.id] || []);
                      const addonsChosen = addons.filter(a => addonIds.includes(a.id));
                      const finalUnitPrice = (selectedVariantFinal?.price || item.price || 0) + addonsChosen.reduce((s, a) => s + (a.price || 0), 0);
                      onAddToCart({
                        ...item,
                        variant_id: selectedVariantFinal?.id || null,
                        variant_name: selectedVariantFinal?.size || null,
                        variant_price: selectedVariantFinal?.price || null,
                        addon_ids: addonIds,
                        addons: addonsChosen,
                        price: finalUnitPrice,
                      }, 1);
                    }}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          );})}
        </div>
      )}
    </div>
  );
}