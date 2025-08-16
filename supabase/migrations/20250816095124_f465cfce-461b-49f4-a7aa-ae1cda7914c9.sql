-- Add status field to order_items for individual item tracking
ALTER TABLE public.order_items 
ADD COLUMN status text DEFAULT 'pending' NOT NULL;

-- Add check constraint for valid statuses
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_status_check 
CHECK (status IN ('pending', 'preparing', 'ready'));

-- Create index for faster batch queries
CREATE INDEX idx_order_items_status_menu_item ON public.order_items(status, menu_item_id);

-- Enable realtime for order_items table
ALTER TABLE public.order_items REPLICA IDENTITY FULL;