import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantSetup } from '@/components/restaurant/RestaurantSetup';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurant() {
      if (!user) return;

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

    fetchRestaurant();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return <RestaurantSetup onComplete={setRestaurant} />;
  }

  return <DashboardLayout restaurant={restaurant} />;
}