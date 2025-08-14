import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, QrCode, Smartphone, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-foreground/10 rounded-full p-4">
              <ChefHat className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">SmartServe</h1>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Complete restaurant ordering and kitchen management platform. QR code menus, real-time orders, and seamless customer experience.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">QR Code Ordering</h3>
            <p className="text-muted-foreground">Customers scan QR codes to browse menus and place orders instantly</p>
          </div>
          <div className="text-center">
            <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Mobile-First</h3>
            <p className="text-muted-foreground">Optimized for mobile devices with a seamless ordering experience</p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kitchen Dashboard</h3>
            <p className="text-muted-foreground">Real-time order management and kitchen workflow optimization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
