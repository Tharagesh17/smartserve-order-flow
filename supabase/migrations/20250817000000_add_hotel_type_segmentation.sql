-- Add Hotel Type Segmentation to SmartServe
-- This migration adds hotel_type column to restaurants table for feature segmentation

-- Create the hotel_type enum
CREATE TYPE public.hotel_type AS ENUM ('cart', 'restaurant', 'hotel');

-- Add hotel_type column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN hotel_type public.hotel_type NOT NULL DEFAULT 'restaurant';

-- Add check constraint to ensure valid hotel types
ALTER TABLE public.restaurants 
ADD CONSTRAINT restaurants_hotel_type_check 
CHECK (hotel_type IN ('cart', 'restaurant', 'hotel'));

-- Create index for faster queries by hotel type
CREATE INDEX idx_restaurants_hotel_type ON public.restaurants(hotel_type);

-- Update existing restaurants to have 'restaurant' as default hotel type
UPDATE public.restaurants 
SET hotel_type = 'restaurant' 
WHERE hotel_type IS NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN public.restaurants.hotel_type IS 'Determines feature access and UI customization for the restaurant';
COMMENT ON TYPE public.hotel_type IS 'Hotel type categories: cart (food cart), restaurant, hotel';
