-- Add Cash Payment System and FIFO Order Queue
-- This migration adds:
-- 1) Cash payment tracking for hotel staff
-- 2) FIFO order queue system
-- 3) Staff payment authorization
-- 4) Order priority management

BEGIN;

-- 1) Add cash payment fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cash_payment_received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cash_payment_received_by UUID REFERENCES public.staff(id),
ADD COLUMN IF NOT EXISTS cash_payment_amount NUMERIC CHECK (cash_payment_amount >= 0),
ADD COLUMN IF NOT EXISTS cash_payment_notes TEXT,
ADD COLUMN IF NOT EXISTS order_priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS queue_position INTEGER DEFAULT 0;

-- 2) Create staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('manager', 'cashier', 'kitchen', 'waiter')),
    is_active BOOLEAN DEFAULT true,
    can_authorize_payments BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT staff_unique_per_restaurant UNIQUE (restaurant_id, email)
);

-- 3) Create cash payment transactions table
CREATE TABLE IF NOT EXISTS public.cash_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Create order queue table for FIFO management
CREATE TABLE IF NOT EXISTS public.order_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    queue_position INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT order_queue_unique_order UNIQUE (order_id),
    CONSTRAINT order_queue_unique_position UNIQUE (restaurant_id, queue_position)
);

-- 5) Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_cash_payment ON public.orders(cash_payment_received_at);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON public.orders(order_priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_orders_queue_position ON public.orders(queue_position);
CREATE INDEX IF NOT EXISTS idx_staff_restaurant_role ON public.staff(restaurant_id, role);
CREATE INDEX IF NOT EXISTS idx_cash_payments_order ON public.cash_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_cash_payments_staff ON public.cash_payments(staff_id);
CREATE INDEX IF NOT EXISTS idx_order_queue_restaurant_status ON public.order_queue(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_queue_position ON public.order_queue(restaurant_id, queue_position);

-- 6) Create function to update order queue positions
CREATE OR REPLACE FUNCTION public.update_order_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
    -- If inserting a new order
    IF TG_OP = 'INSERT' THEN
        -- Get the next available queue position
        SELECT COALESCE(MAX(queue_position), 0) + 1
        INTO NEW.queue_position
        FROM public.order_queue
        WHERE restaurant_id = NEW.restaurant_id;
        
        -- Insert into order queue
        INSERT INTO public.order_queue (restaurant_id, order_id, queue_position, priority)
        VALUES (NEW.restaurant_id, NEW.id, NEW.queue_position, NEW.order_priority);
        
        RETURN NEW;
    END IF;
    
    -- If updating an order
    IF TG_OP = 'UPDATE' THEN
        -- Update queue position if priority changed
        IF OLD.order_priority != NEW.order_priority THEN
            UPDATE public.order_queue
            SET priority = NEW.order_priority,
                updated_at = now()
            WHERE order_id = NEW.id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7) Create trigger to automatically manage order queue
DROP TRIGGER IF EXISTS trigger_update_order_queue ON public.orders;
CREATE TRIGGER trigger_update_order_queue
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_queue_positions();

-- 8) Create function to process cash payment
CREATE OR REPLACE FUNCTION public.process_cash_payment(
    p_order_id UUID,
    p_staff_id UUID,
    p_amount NUMERIC,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_order RECORD;
    v_staff RECORD;
    v_payment_id UUID;
BEGIN
    -- Get order details
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Order not found');
    END IF;
    
    -- Get staff details
    SELECT * INTO v_staff FROM public.staff WHERE id = p_staff_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Staff member not found');
    END IF;
    
    -- Check if staff can authorize payments
    IF NOT v_staff.can_authorize_payments AND v_staff.role != 'manager' THEN
        RETURN json_build_object('success', false, 'error', 'Staff member not authorized to process payments');
    END IF;
    
    -- Check if payment amount matches order total
    IF p_amount < v_order.total_amount THEN
        RETURN json_build_object('success', false, 'error', 'Payment amount is less than order total');
    END IF;
    
    -- Create cash payment record
    INSERT INTO public.cash_payments (order_id, staff_id, amount, notes)
    VALUES (p_order_id, p_staff_id, p_amount, p_notes)
    RETURNING id INTO v_payment_id;
    
    -- Update order with cash payment details
    UPDATE public.orders 
    SET cash_payment_received_at = now(),
        cash_payment_received_by = p_staff_id,
        cash_payment_amount = p_amount,
        cash_payment_notes = p_notes,
        payment_status = 'paid',
        updated_at = now()
    WHERE id = p_order_id;
    
    RETURN json_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'message', 'Cash payment processed successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- 9) Create function to get FIFO order queue
CREATE OR REPLACE FUNCTION public.get_fifo_order_queue(p_restaurant_id UUID)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    customer_name TEXT,
    total_amount NUMERIC,
    queue_position INTEGER,
    priority INTEGER,
    created_at TIMESTAMPTZ,
    status TEXT,
    estimated_wait_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_id as order_number,
        COALESCE(o.customer_name, 'Walk-in Customer') as customer_name,
        o.total_amount,
        oq.queue_position,
        oq.priority,
        o.created_at,
        o.order_status as status,
        -- Estimate wait time based on queue position (15 minutes per order)
        (oq.queue_position - 1) * 15 as estimated_wait_time
    FROM public.order_queue oq
    JOIN public.orders o ON oq.order_id = o.id
    WHERE oq.restaurant_id = p_restaurant_id
    AND oq.status = 'waiting'
    ORDER BY oq.priority DESC, oq.queue_position ASC;
END;
$$ LANGUAGE plpgsql;

-- 10) Create function to move order to next in queue
CREATE OR REPLACE FUNCTION public.move_order_to_next(p_restaurant_id UUID, p_order_id UUID)
RETURNS JSON AS $$
DECLARE
    v_current_position INTEGER;
    v_next_position INTEGER;
BEGIN
    -- Get current position
    SELECT queue_position INTO v_current_position
    FROM public.order_queue
    WHERE restaurant_id = p_restaurant_id AND order_id = p_order_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Order not found in queue');
    END IF;
    
    -- Get next position
    SELECT queue_position INTO v_next_position
    FROM public.order_queue
    WHERE restaurant_id = p_restaurant_id 
    AND queue_position > v_current_position
    ORDER BY queue_position ASC
    LIMIT 1;
    
    IF v_next_position IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Order is already at the end of queue');
    END IF;
    
    -- Swap positions
    UPDATE public.order_queue
    SET queue_position = v_next_position,
        updated_at = now()
    WHERE restaurant_id = p_restaurant_id AND order_id = p_order_id;
    
    UPDATE public.order_queue
    SET queue_position = v_current_position,
        updated_at = now()
    WHERE restaurant_id = p_restaurant_id AND queue_position = v_next_position;
    
    -- Update orders table
    UPDATE public.orders
    SET queue_position = v_next_position,
        updated_at = now()
    WHERE id = p_order_id;
    
    UPDATE public.orders
    SET queue_position = v_current_position,
        updated_at = now()
    WHERE id = (
        SELECT order_id FROM public.order_queue 
        WHERE restaurant_id = p_restaurant_id AND queue_position = v_current_position
    );
    
    RETURN json_build_object('success', true, 'message', 'Order moved to next position');
END;
$$ LANGUAGE plpgsql;

-- 11) Insert default staff roles for existing restaurants
INSERT INTO public.staff (restaurant_id, name, email, role, can_authorize_payments)
SELECT 
    r.id,
    'Manager',
    'manager@' || r.id || '.restaurant.com',
    'manager',
    true
FROM public.restaurants r
WHERE NOT EXISTS (
    SELECT 1 FROM public.staff s WHERE s.restaurant_id = r.id AND s.role = 'manager'
);

-- 12) Update existing orders to have queue positions
UPDATE public.orders 
SET queue_position = subquery.row_num
FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY restaurant_id ORDER BY created_at ASC) as row_num
    FROM public.orders
    WHERE queue_position IS NULL OR queue_position = 0
) subquery
WHERE orders.id = subquery.id;

-- 13) Insert existing orders into order queue
INSERT INTO public.order_queue (restaurant_id, order_id, queue_position, status)
SELECT 
    restaurant_id,
    id,
    queue_position,
    CASE 
        WHEN order_status IN ('completed', 'cancelled') THEN 'completed'
        ELSE 'waiting'
    END
FROM public.orders
WHERE id NOT IN (SELECT order_id FROM public.order_queue);

COMMIT;
