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
  CheckCircle,
  Star,
  Clock,
  Award
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[hsl(var(--nav))] via-[hsl(var(--nav))]/95 to-[hsl(var(--nav))]/90 text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 animate-pulse">
              <ChefHat className="h-20 w-20 text-white" />
            </div>
          </div>
          
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 animate-fade-in">
            🚀 Now with Hotel Type Segmentation
          </Badge>
          
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent animate-fade-in-up">
            SmartServe
          </h1>
          
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            The complete restaurant management platform that adapts to your business. 
            From food carts to luxury hotels, we've got you covered with QR ordering, 
            real-time kitchen management, and powerful analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <Button asChild size="lg" className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 shadow-lg transform hover:scale-105 transition-all">
              <Link to="/auth" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 transform hover:scale-105 transition-all">
              <Link to="/auth">View Demo</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-white/20 rounded-full border-2 border-white/30" />
                ))}
              </div>
              <span className="text-sm">500+ restaurants trust us</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">✨ Features</Badge>
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for every type of food business
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-card">
            <CardContent className="p-8 text-center">
              <div className="bg-[hsl(var(--primary))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="h-8 w-8 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QR Code Ordering</h3>
              <p className="text-muted-foreground leading-relaxed">
                Customers scan QR codes to browse menus and place orders instantly. 
                No app downloads required.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-card">
            <CardContent className="p-8 text-center">
              <div className="bg-[hsl(var(--success))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="h-8 w-8 text-[hsl(var(--success))]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobile-First Design</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimized for mobile devices with a seamless ordering experience 
                that works on any screen size.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-card">
            <CardContent className="p-8 text-center">
              <div className="bg-[hsl(var(--success))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-[hsl(var(--success))]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track sales, popular items, and customer behavior with 
                comprehensive reporting and insights.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-card">
            <CardContent className="p-8 text-center">
              <div className="bg-[hsl(var(--primary))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kitchen Dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time order management and kitchen workflow optimization 
                with batch preparation views.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-card">
            <CardContent className="p-8 text-center">
              <div className="bg-[hsl(var(--secondary))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-[hsl(var(--secondary))]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enterprise-grade security with 99.9% uptime guarantee. 
                Your data is safe with us.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 bg-card">
            <CardContent className="p-8 text-center">
              <div className="bg-[hsl(var(--secondary))]/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-[hsl(var(--secondary))]" />
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
            <Badge variant="secondary" className="mb-4">🏢 Business Types</Badge>
            <h2 className="text-4xl font-bold mb-4">Perfect for Every Business Type</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored solutions for food carts, restaurants, and hotels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-2 border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card">
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
              <Badge variant="outline" className="text-[hsl(var(--primary))] border-[hsl(var(--primary))]">
                Starting at $9/month
              </Badge>
            </Card>
            
            <Card className="text-center p-8 border-2 border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/5 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card">
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
              <Badge variant="outline" className="text-[hsl(var(--success))] border-[hsl(var(--success))]">
                Starting at $19/month
              </Badge>
            </Card>
            
            <Card className="text-center p-8 border-2 border-[hsl(var(--secondary))]/20 bg-[hsl(var(--secondary))]/5 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card">
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
              <Badge variant="outline" className="text-[hsl(var(--secondary))] border-[hsl(var(--secondary))]">
                Starting at $39/month
              </Badge>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">💬 Testimonials</Badge>
          <h2 className="text-4xl font-bold mb-4">Loved by Restaurant Owners</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about SmartServe
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 border-0 shadow-md bg-card">
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "SmartServe transformed our food cart business. Orders increased by 40% in the first month!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[hsl(var(--primary))]/10 rounded-full flex items-center justify-center">
                <span className="text-[hsl(var(--primary))] font-semibold">R</span>
              </div>
              <div>
                <p className="font-semibold">Rajesh Kumar</p>
                <p className="text-sm text-muted-foreground">Food Cart Owner</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-0 shadow-md bg-card">
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "The kitchen dashboard is a game-changer. Our order preparation time reduced by 30%."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[hsl(var(--success))]/10 rounded-full flex items-center justify-center">
                <span className="text-[hsl(var(--success))] font-semibold">P</span>
              </div>
              <div>
                <p className="font-semibold">Priya Sharma</p>
                <p className="text-sm text-muted-foreground">Restaurant Manager</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-0 shadow-md bg-card">
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">
              "Multi-outlet management made simple. Perfect for our hotel chain operations."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[hsl(var(--secondary))]/10 rounded-full flex items-center justify-center">
                <span className="text-[hsl(var(--secondary))] font-semibold">A</span>
              </div>
              <div>
                <p className="font-semibold">Amit Patel</p>
                <p className="text-sm text-muted-foreground">Hotel Operations</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <Badge variant="secondary" className="mb-4">🚀 Get Started</Badge>
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of restaurants already using SmartServe to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 transform hover:scale-105 transition-all">
              <Link to="/auth" className="flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="transform hover:scale-105 transition-all">
              <Link to="/auth">Schedule Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
