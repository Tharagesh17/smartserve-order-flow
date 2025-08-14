import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import { Download, QrCode as QrCodeIcon, ExternalLink, RefreshCw } from 'lucide-react';

interface QRCodeViewProps {
  restaurant: any;
}

export function QRCodeView({ restaurant }: QRCodeViewProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const orderingUrl = `${window.location.origin}/r/${restaurant.id}`;

  useEffect(() => {
    generateQRCode();
  }, [restaurant.id]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(orderingUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#FF5722',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
      
      // Update restaurant with QR code URL
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          qr_code_url: dataUrl,
          ordering_url: orderingUrl 
        })
        .eq('id', restaurant.id);

      if (error) {
        console.error('Failed to save QR code:', error);
      }
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
    setLoading(false);
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${restaurant.name}-qr-code.png`;
    link.href = qrCodeDataUrl;
    link.click();
    
    toast.success('QR code downloaded!');
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(orderingUrl);
      toast.success('Ordering URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <QrCodeIcon className="h-8 w-8" />
            QR Code & Ordering Link
          </h1>
          <p className="text-muted-foreground">
            Share this QR code or link with customers to start receiving orders
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={generateQRCode}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <p className="text-sm text-muted-foreground">
              Customers can scan this code to access your menu
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {loading ? (
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="w-64 h-64 border rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                <QrCodeIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            <Button 
              onClick={downloadQRCode} 
              disabled={!qrCodeDataUrl}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Ordering URL Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ordering URL</CardTitle>
            <p className="text-sm text-muted-foreground">
              Direct link to your online menu
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-mono break-all">
                {orderingUrl}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={copyUrl}
                className="w-full"
                variant="outline"
              >
                Copy URL
              </Button>
              
              <Button 
                onClick={() => window.open(orderingUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Menu
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Print the QR code and display it at tables</li>
                <li>• Share the URL on social media</li>
                <li>• Add the link to your website</li>
                <li>• Include it in marketing materials</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            This is what customers will see when they scan your QR code
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-6 text-center">
            <div className="bg-primary rounded-full p-3 inline-block mb-4">
              <QrCodeIcon className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
            <p className="text-muted-foreground mb-4">{restaurant.location}</p>
            <Button onClick={() => window.open(orderingUrl, '_blank')}>
              View Live Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}