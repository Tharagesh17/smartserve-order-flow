import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChefHat, 
  Menu, 
  ClipboardList, 
  Users, 
  QrCode, 
  LogOut,
  BarChart3,
  Settings,
  Building2,
  Sparkles
} from 'lucide-react';
import { getFeatureFlags, getHotelTypeLabel } from '@/lib/featureFlags';

interface SidebarProps {
  restaurant: any;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ restaurant, activeView, onViewChange }: SidebarProps) {
  const { signOut } = useAuth();
  const features = getFeatureFlags(restaurant.hotel_type);

  // Base menu items that all hotel types have
  const baseMenuItems = [
    { id: 'menu', label: 'Menu', icon: Menu, description: 'Manage your menu items' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, description: 'View and manage orders' },
    { id: 'qr', label: 'QR Code', icon: QrCode, description: 'Generate QR codes for customers' },
  ];

  // Conditional menu items based on hotel type
  const conditionalMenuItems = [];

  // Kitchen dashboard for restaurant and hotel
  if (features.canUseKitchenDashboard) {
    conditionalMenuItems.push({ 
      id: 'kitchen', 
      label: 'Kitchen', 
      icon: ChefHat, 
      description: 'Kitchen order management',
      badge: 'Live'
    });
  }

  // Reports for restaurant and hotel
  if (features.canUseAdvancedReports) {
    conditionalMenuItems.push({ 
      id: 'reports', 
      label: 'Reports', 
      icon: BarChart3, 
      description: 'Analytics and insights' 
    });
  }

  // Staff management for restaurant and hotel
  if (features.canUseStaffRoles) {
    conditionalMenuItems.push({ 
      id: 'staff', 
      label: 'Staff', 
      icon: Users, 
      description: 'Manage team members' 
    });
  }

  // Settings for all types
  conditionalMenuItems.push({ 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    description: 'Business configuration' 
  });

  const allMenuItems = [...baseMenuItems, ...conditionalMenuItems];

  return (
    <div className="w-72 bg-gradient-to-b from-background to-muted/20 border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-3 shadow-lg">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">SmartServe</h2>
            <p className="text-sm text-muted-foreground">Restaurant Management</p>
          </div>
        </div>
        
        {/* Business Info Card */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <Badge variant="secondary" className="text-xs">
              {getHotelTypeLabel(restaurant.hotel_type)}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm text-foreground truncate mb-1">
            {restaurant.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {restaurant.location}
          </p>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Core Features
          </h4>
          {baseMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 px-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-muted/50 hover:text-foreground text-foreground'
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-primary-foreground' : 'text-foreground'}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {item.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {conditionalMenuItems.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Advanced Features
              </h4>
              {conditionalMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 px-3 transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-muted/50 hover:text-foreground text-foreground'
                    }`}
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-primary-foreground' : 'text-foreground'}`} />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {item.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          <div className="text-left">
            <div className="font-medium">Sign Out</div>
            <div className="text-xs text-muted-foreground">Logout from your account</div>
          </div>
        </Button>
      </div>
    </div>
  );
}