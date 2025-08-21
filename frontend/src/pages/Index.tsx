import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  QrCode, 
  Smartphone, 
  BarChart3, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
              <ChefHat className="h-20 w-20 text-white" />
            </div>
          </div>
          
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
            🚀 Now with Hotel Type Segmentation
          </Badge>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            SmartServe
          </h1>
          
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            The complete restaurant management platform that adapts to your business. 
            From food carts to luxury hotels, we've got you covered with QR ordering, 
            real-time kitchen management, and powerful analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              <Link to="/auth" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link to="/auth">View Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for every type of food business
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QR Code Ordering</h3>
              <p className="text-muted-foreground leading-relaxed">
                Customers scan QR codes to browse menus and place orders instantly. 
                No app downloads required.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="bg-green-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobile-First Design</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimized for mobile devices with a seamless ordering experience 
                that works on any screen size.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="bg-blue-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track sales, popular items, and customer behavior with 
                comprehensive reporting and insights.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="bg-orange-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kitchen Dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time order management and kitchen workflow optimization 
                with batch preparation views.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="bg-purple-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enterprise-grade security with 99.9% uptime guarantee. 
                Your data is safe with us.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="bg-pink-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage staff roles, permissions, and multi-outlet operations 
                with ease.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Types Section */}
      <div className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Perfect for Every Business Type</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored solutions for food carts, restaurants, and hotels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-2 border-orange-200 bg-orange-50/50">
              <div className="text-4xl mb-4">🍔</div>
              <h3 className="text-2xl font-bold mb-3">Food Carts</h3>
              <p className="text-muted-foreground mb-6">
                Simple QR ordering, basic menu management, and daily sales tracking.
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Single QR code
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Basic menu management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Daily sales summary
                </li>
              </ul>
            </Card>
            
            <Card className="text-center p-8 border-2 border-blue-200 bg-blue-50/50">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold mb-3">Restaurants</h3>
              <p className="text-muted-foreground mb-6">
                Full-featured ordering system with kitchen management and analytics.
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  QR ordering per table
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Kitchen dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Advanced analytics
                </li>
              </ul>
            </Card>
            
            <Card className="text-center p-8 border-2 border-purple-200 bg-purple-50/50">
              <div className="text-4xl mb-4">🏨</div>
              <h3 className="text-2xl font-bold mb-3">Hotels</h3>
              <p className="text-muted-foreground mb-6">
                Multi-outlet management with room billing and consolidated reporting.
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Multi-outlet support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Room billing integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Consolidated reports
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of restaurants already using SmartServe to streamline their operations.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/auth" className="flex items-center gap-2 mx-auto w-fit">
              Start Your Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
