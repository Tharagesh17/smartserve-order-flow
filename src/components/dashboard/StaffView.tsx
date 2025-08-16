import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getFeatureFlags, getHotelTypeLabel } from '@/lib/featureFlags';
import { Users, Plus, UserPlus, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StaffViewProps {
  restaurant: any;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  outlet?: string;
  is_active: boolean;
}

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
      // In a real app, you'd fetch from a staff table
      // For now, we'll use mock data
      const mockStaff: StaffMember[] = [
        { id: '1', name: 'John Doe', role: 'cashier', outlet: 'main', is_active: true },
        { id: '2', name: 'Jane Smith', role: 'waiter', outlet: 'main', is_active: true },
        { id: '3', name: 'Mike Johnson', role: 'kitchen', outlet: 'main', is_active: true },
      ];
      
      if (restaurant.hotel_type === 'hotel') {
        mockStaff.push(
          { id: '4', name: 'Sarah Wilson', role: 'room_service', outlet: 'room_service', is_active: true },
          { id: '5', name: 'Tom Brown', role: 'manager', outlet: 'main_restaurant', is_active: true }
        );
      }
      
      setStaff(mockStaff);
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
      // In a real app, you'd insert into a staff table
      const newStaffMember: StaffMember = {
        id: Date.now().toString(),
        name: newStaff.name,
        role: newStaff.role,
        outlet: newStaff.outlet || 'main',
        is_active: true
      };

      setStaff([...staff, newStaffMember]);
      setNewStaff({ name: '', role: '', outlet: '', email: '', phone: '' });
      setShowAddForm(false);
      toast.success('Staff member added successfully');
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaff(staff.map(member => 
      member.id === staffId 
        ? { ...member, is_active: !member.is_active }
        : member
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Staff Management</h1>
        </div>
        <div className="text-center py-8">Loading staff data...</div>
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
        <div className="text-center py-8">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Staff Management Not Available</h3>
          <p className="text-muted-foreground">
            Staff management is not available for {getHotelTypeLabel(restaurant.hotel_type).toLowerCase()} accounts.
          </p>
        </div>
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
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Staff Member</CardTitle>
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

                {restaurant.hotel_type === 'hotel' && (
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
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Staff Member</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant={member.is_active ? "default" : "secondary"}>
                  {member.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{member.role}</Badge>
                {member.outlet && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {member.outlet.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={member.is_active ? "outline" : "default"}
                  onClick={() => toggleStaffStatus(member.id)}
                >
                  {member.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4" />
          <p>No staff members found. Add your first staff member to get started.</p>
        </div>
      )}
    </div>
  );
}
