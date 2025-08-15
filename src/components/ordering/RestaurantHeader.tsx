import { Card } from '@/components/ui/card';
import { MapPin, Phone, Mail } from 'lucide-react';

interface RestaurantHeaderProps {
  restaurant: any;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <div className="flex items-center justify-center gap-4 text-primary-foreground/80">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{restaurant.location}</span>
            </div>
            {/* Contact information is only shown to restaurant owners for privacy */}
          </div>
        </div>
      </div>
    </div>
  );
}