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

interface DashboardLayoutProps {
  restaurant: any;
}

export function DashboardLayout({ restaurant }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState('menu');
  const features = getFeatureFlags(restaurant.hotel_type);

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
        return <div className="text-center py-8">Kitchen dashboard not available for your business type.</div>;
      case 'qr':
        return <QRCodeView restaurant={restaurant} />;
      case 'reports':
        if (features.canUseAdvancedReports) {
          return <ReportsView restaurant={restaurant} />;
        }
        return <div className="text-center py-8">Reports not available for your business type.</div>;
      case 'staff':
        if (features.canUseStaffRoles) {
          return <StaffView restaurant={restaurant} />;
        }
        return <div className="text-center py-8">Staff management not available for your business type.</div>;
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
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}