import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { subscriptionService } from '@/lib/subscription';
import { RestaurantSetup } from '@/components/restaurant/RestaurantSetup';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';

export default function Dashboard() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // Check subscription status
      try {
        const hasActiveSubscription = await subscriptionService.hasActiveSubscription(user.id);
        setHasSubscription(hasActiveSubscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setSubscriptionLoading(false);
      }

      // Fetch restaurant data
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!error && data) {
        setRestaurant(data);
      }
      setLoading(false);
    }

    fetchData();
  }, [user]);

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show subscription status if no active subscription
  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Access</h1>
            <p className="text-muted-foreground">
              Subscribe to access the full dashboard and manage your restaurant.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SubscriptionStatus />
            </div>
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Free Plan Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 50 free orders per restaurant</li>
                  <li>• Basic menu management</li>
                  <li>• Order tracking</li>
                  <li>• QR code generation</li>
                </ul>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2 text-primary">Premium Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unlimited orders</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                  <li>• Custom branding</li>
                  <li>• Multiple locations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return <RestaurantSetup onComplete={setRestaurant} />;
  }

  return <DashboardLayout />;
}