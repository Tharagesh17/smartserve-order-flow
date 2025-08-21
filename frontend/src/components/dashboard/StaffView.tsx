import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getFeatureFlags, getHotelTypeLabel } from '@/lib/featureFlags';
import { Users, Plus, UserPlus, Building2, Trash2, Edit, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Database } from '@/integrations/supabase/types';

interface StaffViewProps {
  restaurant: any;
}

type StaffMember = Database['public']['Tables']['staff']['Row'];

const STAFF_ROLES = {
  cart: [],
  restaurant: ['cashier', 'waiter', 'kitchen'],
  hotel: ['cashier', 'waiter', 'kitchen', 'manager', 'room_service']
};

const OUTLET_TYPES = {
  cart: [],
  restaurant: ['main'],
  hotel: ['main_restaurant', 'room_service', 'pool_bar', 'lobby_cafe']
};

export function StaffView({ restaurant }: StaffViewProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    outlet: '',
    email: '',
    phone: ''
  });
  
  const features = getFeatureFlags(restaurant.hotel_type);
  const availableRoles = STAFF_ROLES[restaurant.hotel_type as keyof typeof STAFF_ROLES] || [];
  const availableOutlets = OUTLET_TYPES[restaurant.hotel_type as keyof typeof OUTLET_TYPES] || [];

  useEffect(() => {
    fetchStaff();
  }, [restaurant.id]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to fetch staff data');
      } else {
        setStaff(data || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.name || !newStaff.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('staff')
        .insert({
          restaurant_id: restaurant.id,
          name: newStaff.name,
          role: newStaff.role,
          outlet: newStaff.outlet || null,
          email: newStaff.email || null,
          phone: newStaff.phone || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding staff:', error);
        toast.error('Failed to add staff member');
      } else {
        setStaff([data, ...staff]);
        setNewStaff({ name: '', role: '', outlet: '', email: '', phone: '' });
        setShowAddForm(false);
        toast.success('Staff member added successfully');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const handleUpdateStaff = async (staffId: string, updates: Partial<StaffMember>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', staffId)
        .select()
        .single();

      if (error) {
        console.error('Error updating staff:', error);
        toast.error('Failed to update staff member');
      } else {
        setStaff(staff.map(member => 
          member.id === staffId ? data : member
        ));
        setEditingStaff(null);
        toast.success('Staff member updated successfully');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) {
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff member');
      } else {
        setStaff(staff.filter(member => member.id !== staffId));
        toast.success('Staff member deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    }
  };

  const toggleStaffStatus = async (staffId: string) => {
    const staffMember = staff.find(member => member.id === staffId);
    if (!staffMember) return;

    try {
      const { data, error } = await supabase
        .from('staff')
        .update({ is_active: !staffMember.is_active })
        .eq('id', staffId)
        .select()
        .single();

      if (error) {
        console.error('Error updating staff status:', error);
        toast.error('Failed to update staff status');
      } else {
        setStaff(staff.map(member => 
          member.id === staffId ? data : member
        ));
        toast.success(`Staff member ${data.is_active ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error updating staff status:', error);
      toast.error('Failed to update staff status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Staff Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!features.canUseStaffRoles) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Staff Management</h1>
        </div>
        <Card className="p-8">
          <div className="text-center">
            <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Staff Management Not Available</h3>
            <p className="text-muted-foreground">
              Staff management is not available for {getHotelTypeLabel(restaurant.hotel_type).toLowerCase()} accounts.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Staff Management</h1>
        </div>
        <Badge variant="outline">
          {getHotelTypeLabel(restaurant.hotel_type)}
        </Badge>
      </div>

      {/* Add Staff Button */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
        <Button onClick={fetchStaff} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Staff Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="Enter staff name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={newStaff.role} onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableOutlets.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="outlet">Outlet</Label>
                    <Select value={newStaff.outlet} onValueChange={(value) => setNewStaff({ ...newStaff, outlet: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outlet" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOutlets.map((outlet) => (
                          <SelectItem key={outlet} value={outlet}>
                            {outlet.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="staff@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Add Staff Member
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStaff({ name: '', role: '', outlet: '', email: '', phone: '' });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <div className="space-y-4">
        {staff.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Staff Members</h3>
              <p className="text-muted-foreground text-center">
                Add your first staff member to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          staff.map((member) => (
            <Card key={member.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Role:</strong> {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </div>
                      {member.outlet && (
                        <div>
                          <strong>Outlet:</strong> {member.outlet.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      )}
                      <div>
                        <strong>Added:</strong> {new Date(member.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {(member.email || member.phone) && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {member.email && <span className="mr-4">📧 {member.email}</span>}
                        {member.phone && <span>📞 {member.phone}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStaffStatus(member.id)}
                    >
                      {member.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStaff(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
