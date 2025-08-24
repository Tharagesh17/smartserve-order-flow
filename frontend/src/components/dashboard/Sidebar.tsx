import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  BarChart3, 
  Package, 
  Users, 
  Settings, 
  QrCode, 
  FileText, 
  Sparkles,
  Home,
  Menu,
  Clock,
  UserCheck,
  DollarSign,
  Hash
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  restaurant: any;
}

const baseMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Overview and analytics',
    icon: Home
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Manage incoming orders',
    icon: Package
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    description: 'Order preparation view',
    icon: ChefHat
  },
  {
    id: 'menu',
    label: 'Menu Management',
    description: 'Update your menu items',
    icon: Menu
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Sales and analytics',
    icon: BarChart3
  }
];

const conditionalMenuItems = [
  {
    id: 'fifo-queue',
    label: 'FIFO Queue',
    description: 'Manage order priority and queue',
    icon: Hash,
    badge: 'New'
  },
  {
    id: 'cash-payment',
    label: 'Cash Payments',
    description: 'Process cash payments',
    icon: DollarSign,
    badge: 'New'
  },
  {
    id: 'staff',
    label: 'Staff Management',
    description: 'Manage team members',
    icon: Users,
    badge: 'Pro'
  },
  {
    id: 'qrcodes',
    label: 'QR Codes',
    description: 'Generate and manage QR codes',
    icon: QrCode,
    badge: 'Pro'
  },
  {
    id: 'batch',
    label: 'Batch View',
    description: 'Kitchen batch preparation',
    icon: Clock,
    badge: 'Pro'
  }
];

export function Sidebar({ activeView, onViewChange, restaurant }: SidebarProps) {
  return (
    <div className="w-72 bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-screen text-[hsl(var(--sidebar-foreground))]">
      {/* Header */}
      <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-[hsl(var(--sidebar-primary))] to-[hsl(var(--sidebar-primary))]/80 rounded-xl p-3 shadow-lg">
            <ChefHat className="h-6 w-6 text-[hsl(var(--sidebar-primary-foreground))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SmartServe</h1>
            <p className="text-sm text-white/80">Restaurant Management</p>
          </div>
        </div>
        
        {/* Business Info Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="font-semibold text-white mb-2">{restaurant?.name || 'Restaurant Name'}</h3>
          <div className="space-y-1 text-sm text-white/80">
            <p>Type: {restaurant?.business_type || 'Restaurant'}</p>
            <p>Location: {restaurant?.location || 'Location'}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-xs">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {baseMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 px-3 transition-all duration-200 ${
                isActive
                  ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-md'
                  : 'hover:bg-white/10 hover:text-white text-white'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={`h-4 w-4 mr-3 ${
                isActive ? 'text-[hsl(var(--sidebar-primary-foreground))]' : 'text-white'
              }`} />
              <div className="flex-1 text-left">
                <div className="font-medium">{item.label}</div>
                <div className={`text-xs ${
                  isActive ? 'text-[hsl(var(--sidebar-primary-foreground))]/80' : 'text-white/80'
                }`}>
                  {item.description}
                </div>
              </div>
            </Button>
          );
        })}

        {/* Conditional Pro Features */}
        {conditionalMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 px-3 transition-all duration-200 ${
                isActive
                  ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-md'
                  : 'hover:bg-white/10 hover:text-white text-white'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={`h-4 w-4 mr-3 ${
                isActive ? 'text-[hsl(var(--sidebar-primary-foreground))]' : 'text-white'
              }`} />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1.5 py-0.5 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <div className={`text-xs ${
                  isActive ? 'text-[hsl(var(--sidebar-primary-foreground))]/80' : 'text-white/80'
                }`}>
                  {item.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 px-3 text-white hover:bg-white/10"
          onClick={() => onViewChange('settings')}
        >
          <Settings className="h-4 w-4 mr-3" />
          <div className="text-left">
            <div className="font-medium">Settings</div>
            <div className="text-xs text-white/80">Configure your account</div>
          </div>
        </Button>
        
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
            <UserCheck className="h-3 w-3" />
            <span>Pro Account</span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Upgrade for advanced features
          </p>
        </div>
      </div>
    </div>
  );
}