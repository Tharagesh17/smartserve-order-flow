-- Create Staff Management Table
-- This migration adds a staff table for managing restaurant staff members

-- Create the staff table
CREATE TABLE public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    outlet TEXT,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_staff_restaurant_id ON public.staff(restaurant_id);
CREATE INDEX idx_staff_role ON public.staff(role);
CREATE INDEX idx_staff_is_active ON public.staff(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can only be accessed by restaurant owners
CREATE POLICY "Restaurant owners can manage their staff" ON public.staff
    FOR ALL USING (
        restaurant_id IN (
            SELECT id FROM public.restaurants 
            WHERE owner_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE public.staff IS 'Staff members for each restaurant';
COMMENT ON COLUMN public.staff.restaurant_id IS 'Reference to the restaurant this staff member belongs to';
COMMENT ON COLUMN public.staff.role IS 'Staff role (cashier, waiter, kitchen, etc.)';
COMMENT ON COLUMN public.staff.outlet IS 'Outlet assignment for hotel-type businesses';
COMMENT ON COLUMN public.staff.is_active IS 'Whether the staff member is currently active';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON public.staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
