import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChefHat, 
  Menu, 
  ClipboardList, 
  Users, 
  QrCode, 
  LogOut,
  BarChart3,
  Settings,
  Building2
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
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'qr', label: 'QR Code', icon: QrCode },
  ];

  // Conditional menu items based on hotel type
  const conditionalMenuItems = [];

  // Kitchen dashboard for restaurant and hotel
  if (features.canUseKitchenDashboard) {
    conditionalMenuItems.push({ id: 'kitchen', label: 'Kitchen', icon: ChefHat });
  }

  // Reports for restaurant and hotel
  if (features.canUseAdvancedReports) {
    conditionalMenuItems.push({ id: 'reports', label: 'Reports', icon: BarChart3 });
  }

  // Staff management for restaurant and hotel
  if (features.canUseStaffRoles) {
    conditionalMenuItems.push({ id: 'staff', label: 'Staff', icon: Users });
  }

  // Settings for all types
  conditionalMenuItems.push({ id: 'settings', label: 'Settings', icon: Settings });

  const allMenuItems = [...baseMenuItems, ...conditionalMenuItems];

  return (
    <div className="w-64 bg-card border-r border-border p-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary rounded-lg p-2">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">SmartServe</h2>
            <p className="text-sm text-muted-foreground">Dashboard</p>
          </div>
        </div>
        
        <Card className="p-3 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getHotelTypeLabel(restaurant.hotel_type)}
            </span>
          </div>
          <h3 className="font-medium text-sm text-foreground truncate">
            {restaurant.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {restaurant.location}
          </p>
        </Card>
      </div>

      <nav className="space-y-2">
        {allMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}