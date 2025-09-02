import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  max_orders: number | null;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  start_date: string;
  end_date: string;
  razorpay_subscription_id: string;
  razorpay_plan_id: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
  subscription_plans: SubscriptionPlan;
}

export interface RazorpaySubscriptionOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export class SubscriptionService {
  private static instance: SubscriptionService;

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Get all subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      throw new Error(error.message || 'Failed to fetch subscription plans');
    }
  }

  // Get user's active subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            description,
            price,
            currency,
            duration_days,
            max_orders,
            features
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching user subscription:', error);
      throw new Error(error.message || 'Failed to fetch user subscription');
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      return !!subscription;
    } catch (error) {
      return false;
    }
  }

  // Create subscription
  async createSubscription(userId: string, planId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('subscription-payments', {
        body: {
          action: 'create_subscription',
          user_id: userId,
          plan_id: planId,
          customer_notify: 1,
          total_count: 1
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      throw new Error(error.message || 'Failed to create subscription');
    }
  }

  // Verify subscription payment
  async verifySubscriptionPayment(paymentData: {
    razorpay_subscription_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    user_id: string;
  }): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('subscription-payments', {
        body: {
          action: 'verify_subscription_payment',
          ...paymentData
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error verifying subscription payment:', error);
      throw new Error(error.message || 'Failed to verify subscription payment');
    }
  }

  // Load Razorpay script
  async loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay SDK loaded');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        reject(new Error('Failed to load Razorpay SDK'));
      };
      document.body.appendChild(script);
    });
  }

  // Open Razorpay subscription modal
  async openSubscriptionModal(options: RazorpaySubscriptionOptions): Promise<void> {
    try {
      await this.loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not available');
      }

      const rzp = new window.Razorpay({
        ...options,
        currency: 'INR',
        recurring: true,
        callback_url: window.location.origin + '/dashboard',
        cancel_url: window.location.origin + '/dashboard'
      });

      rzp.open();
    } catch (error: any) {
      console.error('Error opening Razorpay modal:', error);
      throw new Error(error.message || 'Failed to open payment modal');
    }
  }

  // Get user's order count for a restaurant
  async getUserOrderCount(userId: string, restaurantId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_order_count', {
          user_uuid: userId,
          restaurant_uuid: restaurantId
        });

      if (error) {
        throw new Error(error.message);
      }

      return data || 0;
    } catch (error: any) {
      console.error('Error fetching user order count:', error);
      return 0;
    }
  }

  // Increment user's order count
  async incrementUserOrderCount(userId: string, restaurantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('increment_user_order_count', {
          user_uuid: userId,
          restaurant_uuid: restaurantId
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error incrementing user order count:', error);
      throw new Error(error.message || 'Failed to increment order count');
    }
  }

  // Check if user can place order (based on subscription and limits)
  async canPlaceOrder(userId: string, restaurantId: string): Promise<{
    canPlace: boolean;
    reason?: string;
    orderCount?: number;
    limit?: number;
  }> {
    try {
      // Check if user has active subscription
      const hasSubscription = await this.hasActiveSubscription(userId);
      
      if (hasSubscription) {
        return { canPlace: true };
      }

      // Get restaurant's free order limit
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('free_order_limit')
        .eq('id', restaurantId)
        .single();

      const freeLimit = restaurant?.free_order_limit || 50;
      
      // Get user's current order count
      const orderCount = await this.getUserOrderCount(userId, restaurantId);
      
      if (orderCount >= freeLimit) {
        return {
          canPlace: false,
          reason: 'Order limit reached. Please subscribe to continue.',
          orderCount,
          limit: freeLimit
        };
      }

      return {
        canPlace: true,
        orderCount,
        limit: freeLimit
      };
    } catch (error: any) {
      console.error('Error checking order permission:', error);
      return { canPlace: false, reason: 'Error checking order permission' };
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();
