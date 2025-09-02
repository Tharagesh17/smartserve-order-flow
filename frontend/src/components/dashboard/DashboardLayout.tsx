import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { OrdersView } from './OrdersView';
import { KitchenView } from './KitchenView';
import { BatchView } from './BatchView';
import { QRCodeView } from './QRCodeView';

import { MenuManagement } from './MenuManagement';
import { ReportsView } from './ReportsView';

import { CashPaymentView } from './CashPaymentView';
import { StaffView } from './StaffView';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { SettingsView } from './SettingsView';

export function DashboardLayout() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [restaurant, setRestaurant] = useState<Tables<'restaurants'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, [user]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, location, contact_email, contact_phone, hotel_type, is_active, ordering_url, qr_code_url, created_at, updated_at, owner_id')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return;
      }

      setRestaurant(data);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    if (!restaurant) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-muted-foreground">Loading restaurant data...</p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to SmartServe</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Manage your restaurant operations efficiently
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('orders')}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Orders</h3>
                  <p className="text-muted-foreground">View and manage incoming orders</p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('kitchen')}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Kitchen</h3>
                  <p className="text-muted-foreground">Monitor order preparation</p>
                </div>
                

                
                <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('cash-payment')}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cash Payments</h3>
                  <p className="text-muted-foreground">Process cash payments</p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('menu')}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Menu</h3>
                  <p className="text-muted-foreground">Manage your menu items</p>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('reports')}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Reports</h3>
                  <p className="text-muted-foreground">View analytics and insights</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return <OrdersView restaurant={restaurant} />;
      
      case 'kitchen':
        return <KitchenView restaurant={restaurant} />;
      
      case 'menu':
        return <MenuManagement restaurant={restaurant} />;
      
      case 'reports':
        return <ReportsView restaurant={restaurant} />;
      

      
      case 'cash-payment':
        return <CashPaymentView restaurant={restaurant} />;
      
      case 'batch':
        return <BatchView restaurant={restaurant} />;
      
      case 'qrcodes':
        return <QRCodeView restaurant={restaurant} />;
      
      case 'staff':
        return <StaffView restaurant={restaurant} />;
      
      case 'settings':
          return <SettingsView restaurant={restaurant} />;
      
      default:
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground">View Not Found</h1>
            <p className="text-muted-foreground">The requested view is not available.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        restaurant={restaurant} 
      />
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>
    </div>
  );
}