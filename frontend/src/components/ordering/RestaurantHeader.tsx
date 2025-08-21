import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, Phone, Mail, Wifi, CreditCard } from 'lucide-react';

interface RestaurantHeaderProps {
  restaurant: any;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      
      <div className="relative container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Restaurant Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                🍽️ Open Now
              </Badge>
              <div className="flex items-center gap-1 text-white/90">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">4.8</span>
                <span className="text-sm text-white/70">(127 reviews)</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              {restaurant.name}
            </h1>
            
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              Experience the finest dining with our carefully curated menu. 
              Fresh ingredients, authentic flavors, and exceptional service.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{restaurant.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Open until 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
            </div>
          </div>
          
          {/* Quick Info Cards */}
          <div className="flex flex-col gap-3 min-w-[280px]">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Wifi className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Free WiFi</p>
                  <p className="text-xs text-white/70">Available for customers</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Multiple Payment Options</p>
                  <p className="text-xs text-white/70">Cash, Card, UPI accepted</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Fast Service</p>
                  <p className="text-xs text-white/70">Average 15-20 minutes</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}