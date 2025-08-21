import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MenuManagement } from './MenuManagement';
import { OrdersView } from './OrdersView';
import { KitchenView } from './KitchenView';
import { QRCodeView } from './QRCodeView';
import { ReportsView } from './ReportsView';
import { StaffView } from './StaffView';
import { SettingsView } from './SettingsView';
import { getFeatureFlags } from '@/lib/featureFlags';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';

interface DashboardLayoutProps {
  restaurant: any;
}

export function DashboardLayout({ restaurant }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState('menu');
  const features = getFeatureFlags(restaurant.hotel_type);

  const getViewTitle = (view: string) => {
    switch (view) {
      case 'menu': return 'Menu Management';
      case 'orders': return 'Orders';
      case 'kitchen': return 'Kitchen Dashboard';
      case 'qr': return 'QR Code';
      case 'reports': return 'Reports';
      case 'staff': return 'Staff Management';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'menu':
        return <MenuManagement restaurant={restaurant} />;
      case 'orders':
        return <OrdersView restaurant={restaurant} />;
      case 'kitchen':
        if (features.canUseKitchenDashboard) {
          return <KitchenView restaurant={restaurant} />;
        }
        return (
          <Card className="p-8">
            <div className="text-center">
              <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Kitchen Dashboard Not Available</h3>
              <p className="text-muted-foreground">
                Kitchen dashboard is not available for your business type.
              </p>
            </div>
          </Card>
        );
      case 'qr':
        return <QRCodeView restaurant={restaurant} />;
      case 'reports':
        if (features.canUseAdvancedReports) {
          return <ReportsView restaurant={restaurant} />;
        }
        return (
          <Card className="p-8">
            <div className="text-center">
              <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Reports Not Available</h3>
              <p className="text-muted-foreground">
                Advanced reporting is not available for your business type.
              </p>
            </div>
          </Card>
        );
      case 'staff':
        if (features.canUseStaffRoles) {
          return <StaffView restaurant={restaurant} />;
        }
        return (
          <Card className="p-8">
            <div className="text-center">
              <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Staff Management Not Available</h3>
              <p className="text-muted-foreground">
                Staff management is not available for your business type.
              </p>
            </div>
          </Card>
        );
      case 'settings':
        return <SettingsView restaurant={restaurant} />;
      default:
        return <MenuManagement restaurant={restaurant} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        restaurant={restaurant}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <main className="flex-1 overflow-auto">
        {/* Header with Breadcrumbs */}
        <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex h-16 items-center px-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getViewTitle(activeView)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}