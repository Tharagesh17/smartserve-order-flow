import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService, SubscriptionPlan } from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SubscriptionPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const subscriptionPlans = await subscriptionService.getSubscriptionPlans();
      setPlans(subscriptionPlans);
    } catch (error: any) {
      toast.error('Failed to load subscription plans');
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }

    setProcessing(plan.id);

    try {
      // Create subscription
      const { key_id, subscription, db_subscription } = await subscriptionService.createSubscription(
        user.id,
        plan.id
      );

      // Open Razorpay modal
      await subscriptionService.openSubscriptionModal({
        key: key_id,
        subscription_id: subscription.id,
        name: 'SmartServe Subscription',
        description: `${plan.name} - ${plan.description}`,
        prefill: {
          name: user.user_metadata?.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#10b981'
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            await subscriptionService.verifySubscriptionPayment({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id
            });

            toast.success('Subscription activated successfully!');
            // Redirect to dashboard
            window.location.href = '/dashboard';
          } catch (error: any) {
            toast.error('Payment verification failed');
            console.error('Payment verification error:', error);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(null);
          }
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subscription');
      console.error('Subscription error:', error);
      setProcessing(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) {
      return <Crown className="h-6 w-6 text-yellow-500" />;
    }
    return <Star className="h-6 w-6 text-blue-500" />;
  };

  const getPlanBadge = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) {
      return <Badge className="bg-yellow-500 text-white">Premium</Badge>;
    }
    return <Badge className="bg-blue-500 text-white">Basic</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get unlimited orders, advanced analytics, and priority support with our subscription plans.
            Start with 50 free orders, then upgrade when you're ready to scale.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden">
              {plan.name.toLowerCase().includes('premium') && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-sm font-medium transform rotate-45 translate-x-8 -translate-y-2">
                  Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex justify-center mb-2">
                  {getPlanBadge(plan.name)}
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-foreground">
                    {formatPrice(plan.price, plan.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {plan.duration_days >= 365 ? 'year' : 'month'}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6 text-left">
                  {plan.features && Object.entries(plan.features).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {key === 'unlimited_orders' && 'Unlimited Orders'}
                        {key === 'basic_analytics' && 'Basic Analytics'}
                        {key === 'advanced_analytics' && 'Advanced Analytics'}
                        {key === 'priority_support' && 'Priority Support'}
                        {key === 'discount' && 'Yearly Discount'}
                        {typeof value === 'string' && value}
                      </span>
                    </div>
                  ))}
                  
                  {plan.max_orders && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        Up to {plan.max_orders.toLocaleString()} orders
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">
                      {plan.duration_days} days access
                    </span>
                  </div>
                </div>

                {/* Subscribe Button */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={processing === plan.id}
                  className={`w-full ${
                    plan.name.toLowerCase().includes('premium')
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {processing === plan.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {processing === plan.id ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Free Plan Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
              <p className="text-muted-foreground mb-4">
                Start with 50 free orders per restaurant. Perfect for trying out our platform.
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  <span>50 free orders</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  <span>Basic features</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  <span>No credit card required</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
