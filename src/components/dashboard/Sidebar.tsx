import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChefHat, 
  Menu, 
  ClipboardList, 
  Users, 
  QrCode, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  restaurant: any;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ restaurant, activeView, onViewChange }: SidebarProps) {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'qr', label: 'QR Code', icon: QrCode },
  ];

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
          <h3 className="font-medium text-sm text-foreground truncate">
            {restaurant.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {restaurant.location}
          </p>
        </Card>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
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