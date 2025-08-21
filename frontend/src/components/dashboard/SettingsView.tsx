import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { getFeatureFlags, getHotelTypeLabel } from '@/lib/featureFlags';
import { Settings, Save, Building2, QrCode, Bell, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SettingsViewProps {
  restaurant: any;
}

export function SettingsView({ restaurant }: SettingsViewProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    name: restaurant.name || '',
    location: restaurant.location || '',
    contact_email: restaurant.contact_email || '',
    contact_phone: restaurant.contact_phone || '',
    is_active: restaurant.is_active ?? true,
    notifications_enabled: true,
    auto_accept_orders: false,
    require_prepayment: false
  });

  const features = getFeatureFlags(restaurant.hotel_type);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: settings.name,
          location: settings.location,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          is_active: settings.is_active
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Badge variant="outline">
          {getHotelTypeLabel(restaurant.hotel_type)}
        </Badge>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Enter business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Full Address</Label>
            <Textarea
              id="location"
              value={settings.location}
              onChange={(e) => setSettings({ ...settings, location: e.target.value })}
              placeholder="Enter full address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Status */}
      <Card>
        <CardHeader>
          <CardTitle>Business Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable your business for customers
              </p>
            </div>
            <Switch
              checked={settings.is_active}
              onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Order Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-accept Orders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically accept incoming orders
              </p>
            </div>
            <Switch
              checked={settings.auto_accept_orders}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_accept_orders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Prepayment</Label>
              <p className="text-sm text-muted-foreground">
                Require payment before order preparation
              </p>
            </div>
            <Switch
              checked={settings.require_prepayment}
              onCheckedChange={(checked) => setSettings({ ...settings, require_prepayment: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for orders and updates
              </p>
            </div>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Available Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Menu Management</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>• Allergy Tags:</span>
                  <Badge variant={features.canUseAllergyTags ? "default" : "secondary"}>
                    {features.canUseAllergyTags ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>• Modifiers:</span>
                  <Badge variant={features.canUseModifiers ? "default" : "secondary"}>
                    {features.canUseModifiers ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>• Multiple Menus:</span>
                  <Badge variant={features.canUseMultipleMenus ? "default" : "secondary"}>
                    {features.canUseMultipleMenus ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Advanced Features</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>• Kitchen Dashboard:</span>
                  <Badge variant={features.canUseKitchenDashboard ? "default" : "secondary"}>
                    {features.canUseKitchenDashboard ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>• Staff Management:</span>
                  <Badge variant={features.canUseStaffRoles ? "default" : "secondary"}>
                    {features.canUseStaffRoles ? "Available" : "Not Available"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>• Advanced Reports:</span>
                  <Badge variant={features.canUseAdvancedReports ? "default" : "secondary"}>
                    {features.canUseAdvancedReports ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
