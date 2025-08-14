import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MenuManagement } from './MenuManagement';
import { OrdersView } from './OrdersView';
import { KitchenView } from './KitchenView';
import { QRCodeView } from './QRCodeView';

interface DashboardLayoutProps {
  restaurant: any;
}

export function DashboardLayout({ restaurant }: DashboardLayoutProps) {
  const [activeView, setActiveView] = useState('menu');

  const renderContent = () => {
    switch (activeView) {
      case 'menu':
        return <MenuManagement restaurant={restaurant} />;
      case 'orders':
        return <OrdersView restaurant={restaurant} />;
      case 'kitchen':
        return <KitchenView restaurant={restaurant} />;
      case 'qr':
        return <QRCodeView restaurant={restaurant} />;
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