import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Store } from 'lucide-react';
import { getHotelTypeLabel, getHotelTypeDescription, HotelType } from '@/lib/featureFlags';

interface RestaurantSetupProps {
  onComplete: (restaurant: any) => void;
}

export function RestaurantSetup({ onComplete }: RestaurantSetupProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hotelType, setHotelType] = useState<HotelType>('restaurant');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const restaurantData = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string,
      hotel_type: hotelType,
      owner_id: user.id,
    };

    const { data, error } = await supabase
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (error) {
      toast.error('Failed to setup restaurant: ' + error.message);
    } else {
      toast.success('Restaurant setup complete!');
      onComplete(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Setup Your Business</h1>
          <p className="text-muted-foreground mt-2">
            Let's get your business details configured
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hotel_type">Business Type *</Label>
                <Select value={hotelType} onValueChange={(value: HotelType) => setHotelType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cart">Food Cart</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {getHotelTypeDescription(hotelType)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={`Enter ${getHotelTypeLabel(hotelType).toLowerCase()} name`}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Textarea
                  id="location"
                  name="location"
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  placeholder="business@example.com"
                  defaultValue={user?.email}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}