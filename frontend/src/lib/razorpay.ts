import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
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

export class RazorpayService {
  private static instance: RazorpayService;
  private supabaseUrl: string;

  private constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  }

  public static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  async createOrder(orderData: {
    amount: number;
    currency: string;
    receipt: string;
    db_order_id: string;
    notes?: Record<string, string>;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('payments-razorpay', {
        body: {
          action: 'create_order',
          ...orderData
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    db_order_id: string;
    amount: number;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('payments-razorpay', {
        body: {
          action: 'verify_payment',
          ...paymentData
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
  }

  openPayment(options: RazorpayOptions) {
    if (typeof window === 'undefined' || !window.Razorpay) {
      throw new Error('Razorpay is not loaded');
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
    return rzp;
  }

  formatAmount(amount: number): number {
    // Razorpay expects amount in paise (smallest currency unit)
    return Math.round(amount * 100);
  }
}

export const razorpayService = RazorpayService.getInstance();
