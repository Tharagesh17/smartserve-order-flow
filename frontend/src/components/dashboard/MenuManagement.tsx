import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Leaf } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface MenuManagementProps {
  restaurant: any;
}

export function MenuManagement({ restaurant }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isVegChecked, setIsVegChecked] = useState<boolean>(false);
  const [allergenOptions, setAllergenOptions] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [newAllergen, setNewAllergen] = useState<string>('');
  const [variants, setVariants] = useState<Array<{ id?: string; size: string; price: number | '' }>>([]);
  const [addons, setAddons] = useState<Array<{ id?: string; name: string; price: number | '' }>>([]);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchAllergens();
  }, [restaurant.id]);

  useEffect(() => {
    if (isDialogOpen) {
      setImagePreview(editingItem?.image_url || '');
      setAddingCategory(false);
      setIsVegChecked(!!editingItem?.is_veg);
      const initialAllergens = Array.isArray(editingItem?.allergy_tags) ? (editingItem as any).allergy_tags : [];
      setSelectedAllergens((initialAllergens as any) || []);
      setAllergenOptions(prev => Array.from(new Set([...(prev || []), ...((initialAllergens as any) || [])])));
      // Prefill variants and addons
      if (editingItem) {
        const v = ((editingItem as any).menu_item_prices || []).map((p: any) => ({ id: p.id, size: p.size || '', price: p.price ?? '' }));
        const a = ((editingItem as any).menu_item_addons || []).map((ad: any) => ({ id: ad.id, name: ad.name || '', price: ad.price ?? '' }));
        setVariants(v.length > 0 ? v : [{ size: 'Regular', price: (editingItem as any).price || '' }]);
        setAddons(a);
      } else {
        setVariants([{ size: 'Regular', price: '' }]);
        setAddons([]);
      }
    }
  }, [isDialogOpen, editingItem]);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        is_veg,
        is_available,
        image_url,
        restaurant_id,
        created_at,
        updated_at,
        calories,
        categories:category_id ( name ),
        menu_item_prices ( id, size, price ),
        menu_item_allergens ( allergens ( name ) ),
        menu_item_addons ( id, name, price )
      `)
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch menu items');
    } else {
      const mapped = (data || []).map((mi: any) => {
        const regular = (mi.menu_item_prices || []).find((p: any) => p.size?.toLowerCase() === 'regular');
        const minPrice = (mi.menu_item_prices || []).reduce((acc: number | null, p: any) => {
          if (p?.price == null) return acc;
          if (acc == null) return p.price;
          return Math.min(acc, p.price);
        }, null);
        const price = regular?.price ?? minPrice ?? 0;
        const allergy_tags = (mi.menu_item_allergens || [])
          .map((x: any) => x?.allergens?.name)
          .filter((n: any) => !!n);
        return {
          ...mi,
          price,
          category: mi.categories?.name ?? null,
          allergy_tags,
        };
      });
      setMenuItems(mapped);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('restaurant_id', restaurant.id)
      .order('name', { ascending: true });
    if (!error) {
      setCategories((data || []).map((c: any) => c.name));
    }
  };

  const fetchAllergens = async () => {
    const { data, error } = await supabase
      .from('allergens')
      .select('name')
      .order('name', { ascending: true });
    if (!error) {
      setAllergenOptions(Array.from(new Set((data || []).map((a: any) => a.name))));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const name = (formData.get('name') as string || '').trim();
    const descriptionRaw = (formData.get('description') as string) || '';
    const description = descriptionRaw ? descriptionRaw.trim() : null;
    const inputPrice = parseFloat(formData.get('price') as string);
    const selectedCategory = (formData.get('category') as string) || '';
    const newCategory = (formData.get('new_category') as string || '').trim();
    const categoryName = selectedCategory === '__add_new__' ? newCategory : selectedCategory;
    const isVeg = formData.get('is_veg') === 'on';
    const isAvailable = formData.get('is_available') === 'on';
    const allergyTags = (selectedAllergens || []).map(a => a.toLowerCase());
    const imageUrlInput = ((formData.get('image_url') as string) || '').trim();
    const imageFile = formData.get('image_file') as File | null;

    // Validations
    if (!name || name.length < 2) {
      toast.error('Name is required (min 2 characters)');
      return;
    }
    const variantInputs = (variants || [])
      .map(v => ({ size: (v.size || '').trim(), price: parseFloat(String(v.price)) }))
      .filter(v => v.size && Number.isFinite(v.price) && v.price >= 0);

    if (!Number.isFinite(inputPrice) && variantInputs.length === 0) {
      toast.error('Add at least one variant with price or enter a base Price');
      return;
    }
    if (Number.isFinite(inputPrice) && inputPrice <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (!categoryName) {
      toast.error('Category is required');
      return;
    }
    if (description && description.length > 300) {
      toast.error('Description must be at most 300 characters');
      return;
    }
    if (imageUrlInput) {
      try { new URL(imageUrlInput); } catch { toast.error('Image URL is invalid'); return; }
    }

    // Ensure category exists and get its id
    let categoryId: string | null = null;
    if (categoryName) {
      const { data: upsertCat, error: upsertCatErr } = await supabase
        .from('categories')
        .upsert({ restaurant_id: restaurant.id, name: categoryName }, { onConflict: 'restaurant_id,name' })
        .select('id')
        .single();
      if (upsertCatErr) {
        toast.error('Failed to save category');
        return;
      }
      categoryId = upsertCat?.id || null;
      // Refresh dropdown in background
      fetchCategories();
    }

    // Handle image upload (optional). If a file is provided, upload it; else prefer the URL input; else keep existing (when editing)
    let finalImageUrl: string | null = editingItem?.image_url || null;
    if (imageFile && (imageFile as any).size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `restaurant_${restaurant.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadErr } = await supabase
        .storage
        .from('menu-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: (imageFile as any).type,
        });
      if (uploadErr) {
        console.error(uploadErr);
        toast.error('Image upload failed');
        return;
      }
      const { data: pub } = supabase
        .storage
        .from('menu-images')
        .getPublicUrl(filePath);
      finalImageUrl = pub.publicUrl;
    } else if (imageUrlInput) {
      finalImageUrl = imageUrlInput;
    }


    // Insert or update the menu item
    let menuItemId: string | null = null;
    if (editingItem) {
      const { data: upd, error } = await supabase
        .from('menu_items')
        .update({
          name,
          description,
          is_veg: isVeg,
          is_available: isAvailable,
          restaurant_id: restaurant.id,
          category_id: categoryId,
          image_url: finalImageUrl,
        })
        .eq('id', editingItem.id)
        .select('id')
        .single();

      if (error) {
        toast.error('Failed to update menu item');
        return;
      }
      menuItemId = upd?.id || editingItem.id;
    } else {
      const { data: ins, error } = await supabase
        .from('menu_items')
        .insert([{ name, description, is_veg: isVeg, is_available: isAvailable, restaurant_id: restaurant.id, category_id: categoryId, image_url: finalImageUrl }])
        .select('id')
        .single();

      if (error) {
        toast.error('Failed to add menu item');
        return;
      }
      menuItemId = ins?.id || null;
    }

    if (!menuItemId) {
      toast.error('Menu item id not found');
      return;
    }

    // Persist variants (sizes/prices)
    const variantsToSave = [...variantInputs];
    if (variantsToSave.length === 0 && Number.isFinite(inputPrice)) {
      variantsToSave.push({ size: 'Regular', price: inputPrice });
    }
    // Replace existing variants with current set
    await supabase.from('menu_item_prices').delete().eq('menu_item_id', menuItemId);
    if (variantsToSave.length > 0) {
      const { error: variantsErr } = await supabase
        .from('menu_item_prices')
        .insert(variantsToSave.map(v => ({ menu_item_id: menuItemId, size: v.size, price: v.price })));
      if (variantsErr) {
        toast.error('Failed to save variants');
        return;
      }
    }

    // Persist add-ons
    const addonInputs = (addons || [])
      .map(a => ({ name: (a.name || '').trim(), price: parseFloat(String(a.price)) }))
      .filter(a => a.name && Number.isFinite(a.price) && a.price >= 0);
    await supabase.from('menu_item_addons').delete().eq('menu_item_id', menuItemId);
    if (addonInputs.length > 0) {
      const { error: addonsErr } = await supabase
        .from('menu_item_addons')
        .insert(addonInputs.map(a => ({ menu_item_id: menuItemId, name: a.name, price: a.price })));
      if (addonsErr) {
        toast.error('Failed to save add-ons');
        return;
      }
    }

    // Replace allergens
    if (editingItem) {
      await supabase.from('menu_item_allergens').delete().eq('menu_item_id', menuItemId);
    }
    if (allergyTags.length > 0) {
      for (const tag of allergyTags) {
        const { data: a, error: aErr } = await supabase
          .from('allergens')
          .upsert({ name: tag }, { onConflict: 'name' })
          .select('id')
          .single();
        if (aErr) continue;
        if (!a?.id) continue;
        await supabase
          .from('menu_item_allergens')
          .upsert({ menu_item_id: menuItemId, allergen_id: a.id }, { onConflict: 'menu_item_id,allergen_id' });
      }
    }

    toast.success(editingItem ? 'Menu item updated successfully' : 'Menu item added successfully');
    fetchMenuItems();
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete menu item');
    } else {
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    }
  };

  const toggleAvailability = async (item: any) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update availability');
    } else {
      fetchMenuItems();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant's menu items</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs text-muted-foreground">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Item name"
                      defaultValue={editingItem?.name || ''}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs text-muted-foreground">Description (max 300 chars)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Item description"
                      defaultValue={editingItem?.description || ''}
                      maxLength={300}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs text-muted-foreground">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      defaultValue={editingItem?.price || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs text-muted-foreground">Category *</Label>
                    <Select name="category" defaultValue={editingItem?.category || ''} onValueChange={(v) => {
                      setAddingCategory(v === '__add_new__');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                        <SelectItem value="__add_new__">+ Add New Category</SelectItem>
                      </SelectContent>
                    </Select>
                    {addingCategory && (
                      <div className="mt-2">
                        <Input name="new_category" placeholder="Enter new category name" />
                      </div>
                    )}
                  </div>

                  {/* Variants (Sizes) */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Variants (size + price)</Label>
                    <div className="space-y-2">
                      {variants.map((v, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="Size (e.g., Small)"
                            value={v.size}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariants(prev => prev.map((p, i) => i === idx ? { ...p, size: val } : p));
                            }}
                          />
                          <Input
                            placeholder="Price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={v.price as any}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              const val: number | '' = valStr === '' ? '' : parseFloat(valStr);
                              setVariants(prev => prev.map((p, i) => i === idx ? { ...p, price: val } : p));
                            }}
                          />
                          <Button type="button" variant="outline" onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}>Remove</Button>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" onClick={() => setVariants(prev => [...prev, { size: '', price: '' }])}>+ Add Variant</Button>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch id="is_veg_switch" checked={isVegChecked} onCheckedChange={(v) => setIsVegChecked(!!v)} />
                    <Label htmlFor="is_veg_switch" className="text-xs text-muted-foreground">Vegetarian</Label>
                    <input type="hidden" name="is_veg" value={isVegChecked ? 'on' : ''} />
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch id="is_available" name="is_available" defaultChecked={editingItem?.is_available ?? true} />
                    <Label htmlFor="is_available" className="text-xs text-muted-foreground">Available</Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Allergy Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new allergen and press Enter"
                        value={newAllergen}
                        onChange={(e) => setNewAllergen(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = newAllergen.trim().toLowerCase();
                            if (!val) return;
                            setAllergenOptions(prev => Array.from(new Set([...(prev || []), val])));
                            setSelectedAllergens(prev => Array.from(new Set([...(prev || []), val])));
                            setNewAllergen('');
                          }
                        }}
                      />
                      <Button type="button" onClick={() => {
                        const val = newAllergen.trim().toLowerCase();
                        if (!val) return;
                        setAllergenOptions(prev => Array.from(new Set([...(prev || []), val])));
                        setSelectedAllergens(prev => Array.from(new Set([...(prev || []), val])));
                        setNewAllergen('');
                      }}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allergenOptions.map(tag => {
                        const selected = selectedAllergens.includes(tag);
                        return (
                          <Button
                            key={tag}
                            type="button"
                            size="sm"
                            variant={selected ? 'default' : 'outline'}
                            className="rounded-full"
                            onClick={() => {
                              setSelectedAllergens(prev => selected ? prev.filter(t => t !== tag) : [...prev, tag]);
                            }}
                          >
                            {selected ? '✓ ' : ''}{tag}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Add-ons (name + price)</Label>
                    <div className="space-y-2">
                      {addons.map((ad, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="Add-on name (e.g., Extra Cheese)"
                            value={ad.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddons(prev => prev.map((p, i) => i === idx ? { ...p, name: val } : p));
                            }}
                          />
                          <Input
                            placeholder="Price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={ad.price as any}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              const val: number | '' = valStr === '' ? '' : parseFloat(valStr);
                              setAddons(prev => prev.map((p, i) => i === idx ? { ...p, price: val } : p));
                            }}
                          />
                          <Button type="button" variant="outline" onClick={() => setAddons(prev => prev.filter((_, i) => i !== idx))}>Remove</Button>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" onClick={() => setAddons(prev => [...prev, { name: '', price: '' }])}>+ Add Add-on</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Image</Label>
                    <Input id="image_file" name="image_file" type="file" accept="image/*" onChange={(ev) => {
                      const file = (ev.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }} />
                    <Input id="image_url" name="image_url" type="url" placeholder="https://..." defaultValue={editingItem?.image_url || ''} onBlur={(ev) => {
                      const v = (ev.target as HTMLInputElement).value;
                      if (v) setImagePreview(v);
                    }} />
                    {imagePreview && (
                      <div className="mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-lg hover:shadow-md">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {menuItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No menu items yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          menuItems.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.is_veg && (
                        <Badge variant="secondary" className="bg-success text-success-foreground">
                          <Leaf className="h-3 w-3 mr-1" />
                          Veg
                        </Badge>
                      )}
                      {!item.is_available && (
                        <Badge variant="destructive">Unavailable</Badge>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-muted-foreground mb-2">{item.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(item.price)}
                      </span>
                      {item.category && (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                    </div>
                    
                    {item.allergy_tags && item.allergy_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.allergy_tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={() => toggleAvailability(item)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingItem(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}