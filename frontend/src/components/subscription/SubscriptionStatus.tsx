import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService, UserSubscription } from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Crown, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const userSubscription = await subscriptionService.getUserSubscription(user!.id);
      setSubscription(userSubscription);
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressPercentage = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const getStatusIcon = () => {
    if (!subscription) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    
    if (subscription.status === 'active') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (!subscription) {
      return <Badge variant="secondary">No Subscription</Badge>;
    }
    
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/subscription';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Subscription Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            {/* Plan Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {subscription.subscription_plans.name.toLowerCase().includes('premium') ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Star className="h-5 w-5 text-blue-500" />
                )}
                <span className="font-medium">{subscription.subscription_plans.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {subscription.subscription_plans.price} {subscription.subscription_plans.currency}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subscription Progress</span>
                <span>{Math.round(getProgressPercentage(subscription.start_date, subscription.end_date))}%</span>
              </div>
              <Progress value={getProgressPercentage(subscription.start_date, subscription.end_date)} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center space-x-1 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Started</span>
                </div>
                <span className="font-medium">{formatDate(subscription.start_date)}</span>
              </div>
              <div>
                <div className="flex items-center space-x-1 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Expires</span>
                </div>
                <span className="font-medium">{formatDate(subscription.end_date)}</span>
              </div>
            </div>

            {/* Days Remaining */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {getDaysRemaining(subscription.end_date)}
                </div>
                <div className="text-sm text-muted-foreground">
                  days remaining
                </div>
              </div>
            </div>

            {/* Features */}
            {subscription.subscription_plans.features && (
              <div>
                <h4 className="font-medium mb-2">Plan Features:</h4>
                <div className="space-y-1">
                  {Object.entries(subscription.subscription_plans.features).map(([key, value]) => (
                    <div key={key} className="flex items-center text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      <span>
                        {key === 'unlimited_orders' && 'Unlimited Orders'}
                        {key === 'basic_analytics' && 'Basic Analytics'}
                        {key === 'advanced_analytics' && 'Advanced Analytics'}
                        {key === 'priority_support' && 'Priority Support'}
                        {key === 'discount' && 'Yearly Discount'}
                        {typeof value === 'string' && value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <p className="mb-2">You're currently on the free plan</p>
              <p className="text-sm">Get unlimited orders and advanced features</p>
            </div>
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
