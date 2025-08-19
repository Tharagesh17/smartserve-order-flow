-- Menu Management Restructure
-- 1) Introduce categories table and link from menu_items
-- 2) Introduce menu_item_prices (variants) and menu_item_addons
-- 3) Convert allergy_tags from text[] to relational allergens/menu_item_allergens
-- 4) Introduce tags/menu_item_tags for flags like Popular/New/Sugar-Free
-- 5) Cleanup menu_items: drop price, category, allergy_tags; add optional calories

BEGIN;

-- Ensure helper exists (created earlier in migrations)
-- Function: public.update_updated_at_column()

-- 1) Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT categories_unique_per_restaurant UNIQUE (restaurant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON public.categories(restaurant_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Variants (Prices)
CREATE TABLE IF NOT EXISTS public.menu_item_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT menu_item_prices_unique_size_per_item UNIQUE (menu_item_id, size)
);

CREATE INDEX IF NOT EXISTS idx_menu_item_prices_item_id ON public.menu_item_prices(menu_item_id);

DROP TRIGGER IF EXISTS update_menu_item_prices_updated_at ON public.menu_item_prices;
CREATE TRIGGER update_menu_item_prices_updated_at
    BEFORE UPDATE ON public.menu_item_prices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Add-ons
CREATE TABLE IF NOT EXISTS public.menu_item_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT menu_item_addons_unique_name_per_item UNIQUE (menu_item_id, name)
);

CREATE INDEX IF NOT EXISTS idx_menu_item_addons_item_id ON public.menu_item_addons(menu_item_id);

DROP TRIGGER IF EXISTS update_menu_item_addons_updated_at ON public.menu_item_addons;
CREATE TRIGGER update_menu_item_addons_updated_at
    BEFORE UPDATE ON public.menu_item_addons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Allergens and join table
CREATE TABLE IF NOT EXISTS public.allergens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_allergens_updated_at ON public.allergens;
CREATE TRIGGER update_allergens_updated_at
    BEFORE UPDATE ON public.allergens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.menu_item_allergens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES public.allergens(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT menu_item_allergens_unique UNIQUE (menu_item_id, allergen_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_item_allergens_item_id ON public.menu_item_allergens(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_allergens_allergen_id ON public.menu_item_allergens(allergen_id);

DROP TRIGGER IF EXISTS update_menu_item_allergens_updated_at ON public.menu_item_allergens;
CREATE TRIGGER update_menu_item_allergens_updated_at
    BEFORE UPDATE ON public.menu_item_allergens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Tags and join table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.menu_item_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT menu_item_tags_unique UNIQUE (menu_item_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_menu_item_tags_item_id ON public.menu_item_tags(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_tags_tag_id ON public.menu_item_tags(tag_id);

DROP TRIGGER IF EXISTS update_menu_item_tags_updated_at ON public.menu_item_tags;
CREATE TRIGGER update_menu_item_tags_updated_at
    BEFORE UPDATE ON public.menu_item_tags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6) menu_items cleanup and linkage
-- Add category_id and optional calories first
ALTER TABLE public.menu_items
    ADD COLUMN IF NOT EXISTS category_id UUID NULL REFERENCES public.categories(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS calories INTEGER NULL;

-- Data migration: categories from existing text field
-- Create categories per restaurant from distinct existing menu_items.category values
WITH distinct_categories AS (
    SELECT DISTINCT mi.restaurant_id, TRIM(mi.category) AS name
    FROM public.menu_items mi
    WHERE mi.category IS NOT NULL AND TRIM(mi.category) <> ''
)
INSERT INTO public.categories (restaurant_id, name)
SELECT dc.restaurant_id, dc.name
FROM distinct_categories dc
ON CONFLICT (restaurant_id, name) DO NOTHING;

-- Link menu_items to categories by name
UPDATE public.menu_items mi
SET category_id = c.id
FROM public.categories c
WHERE c.restaurant_id = mi.restaurant_id
  AND TRIM(COALESCE(mi.category, '')) <> ''
  AND c.name = TRIM(mi.category);

-- Data migration: move price into variants as 'Regular'
INSERT INTO public.menu_item_prices (menu_item_id, size, price)
SELECT mi.id, 'Regular'::text AS size, mi.price
FROM public.menu_items mi
WHERE mi.price IS NOT NULL;

-- Data migration: allergy_tags -> allergens + join table
-- Insert distinct allergens
WITH all_tags AS (
    SELECT DISTINCT LOWER(TRIM(t.tag)) AS name
    FROM public.menu_items mi
    CROSS JOIN LATERAL UNNEST(mi.allergy_tags) AS t(tag)
    WHERE mi.allergy_tags IS NOT NULL
), cleaned AS (
    SELECT name FROM all_tags WHERE name IS NOT NULL AND name <> ''
)
INSERT INTO public.allergens (name)
SELECT name FROM cleaned
ON CONFLICT (name) DO NOTHING;

-- Create menu_item_allergens links
INSERT INTO public.menu_item_allergens (menu_item_id, allergen_id)
SELECT mi.id, a.id
FROM public.menu_items mi
CROSS JOIN LATERAL UNNEST(mi.allergy_tags) AS t(tag)
JOIN public.allergens a ON a.name = LOWER(TRIM(t.tag))
WHERE mi.allergy_tags IS NOT NULL
ON CONFLICT (menu_item_id, allergen_id) DO NOTHING;

-- Finally, drop old columns
ALTER TABLE public.menu_items
    DROP COLUMN IF EXISTS price,
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS allergy_tags;

-- 7) Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_tags ENABLE ROW LEVEL SECURITY;

-- Categories policies
DROP POLICY IF EXISTS "Public can view categories of active restaurants" ON public.categories;
CREATE POLICY "Public can view categories of active restaurants" ON public.categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = categories.restaurant_id
              AND r.is_active = true
        )
    );

DROP POLICY IF EXISTS "Owners can manage their categories" ON public.categories;
CREATE POLICY "Owners can manage their categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = categories.restaurant_id
              AND r.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = categories.restaurant_id
              AND r.owner_id = auth.uid()
        )
    );

-- Prices policies
DROP POLICY IF EXISTS "Public can view prices for available items at active restaurants" ON public.menu_item_prices;
CREATE POLICY "Public can view prices for available items at active restaurants" ON public.menu_item_prices
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_prices.menu_item_id
              AND mi.is_available = true
              AND r.is_active = true
        )
    );

DROP POLICY IF EXISTS "Owners can manage prices" ON public.menu_item_prices;
CREATE POLICY "Owners can manage prices" ON public.menu_item_prices
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_prices.menu_item_id
              AND r.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_prices.menu_item_id
              AND r.owner_id = auth.uid()
        )
    );

-- Addons policies
DROP POLICY IF EXISTS "Public can view addons for available items at active restaurants" ON public.menu_item_addons;
CREATE POLICY "Public can view addons for available items at active restaurants" ON public.menu_item_addons
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_addons.menu_item_id
              AND mi.is_available = true
              AND r.is_active = true
        )
    );

DROP POLICY IF EXISTS "Owners can manage addons" ON public.menu_item_addons;
CREATE POLICY "Owners can manage addons" ON public.menu_item_addons
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_addons.menu_item_id
              AND r.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_addons.menu_item_id
              AND r.owner_id = auth.uid()
        )
    );

-- Allergens policies
DROP POLICY IF EXISTS "Anyone can view allergens" ON public.allergens;
CREATE POLICY "Anyone can view allergens" ON public.allergens
    FOR SELECT USING (true);

-- Allow restaurant owners to manage global allergens (optional)
DROP POLICY IF EXISTS "Owners can manage allergens" ON public.allergens;
CREATE POLICY "Owners can manage allergens" ON public.allergens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.owner_id = auth.uid()
        )
    );

-- Menu item allergens policies
DROP POLICY IF EXISTS "Public can view item allergens for available items at active restaurants" ON public.menu_item_allergens;
CREATE POLICY "Public can view item allergens for available items at active restaurants" ON public.menu_item_allergens
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_allergens.menu_item_id
              AND mi.is_available = true
              AND r.is_active = true
        )
    );

DROP POLICY IF EXISTS "Owners can manage item allergens" ON public.menu_item_allergens;
CREATE POLICY "Owners can manage item allergens" ON public.menu_item_allergens
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_allergens.menu_item_id
              AND r.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_allergens.menu_item_id
              AND r.owner_id = auth.uid()
        )
    );

-- Tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;
CREATE POLICY "Anyone can view tags" ON public.tags
    FOR SELECT USING (true);

-- Allow restaurant owners to manage global tags (optional)
DROP POLICY IF EXISTS "Owners can manage tags" ON public.tags;
CREATE POLICY "Owners can manage tags" ON public.tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.owner_id = auth.uid()
        )
    );

-- Menu item tags policies
DROP POLICY IF EXISTS "Public can view item tags for available items at active restaurants" ON public.menu_item_tags;
CREATE POLICY "Public can view item tags for available items at active restaurants" ON public.menu_item_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_tags.menu_item_id
              AND mi.is_available = true
              AND r.is_active = true
        )
    );

DROP POLICY IF EXISTS "Owners can manage item tags" ON public.menu_item_tags;
CREATE POLICY "Owners can manage item tags" ON public.menu_item_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_tags.menu_item_id
              AND r.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.menu_items mi
            JOIN public.restaurants r ON r.id = mi.restaurant_id
            WHERE mi.id = menu_item_tags.menu_item_id
              AND r.owner_id = auth.uid()
        )
    );

-- Comments for documentation
COMMENT ON TABLE public.categories IS 'Categories for menu items per restaurant';
COMMENT ON COLUMN public.categories.name IS 'Category name (e.g., Nutty Sundaes, Softies)';
COMMENT ON TABLE public.menu_item_prices IS 'Per-item size/price variants';
COMMENT ON COLUMN public.menu_item_prices.size IS 'Variant size (e.g., Small, Medium, Large)';
COMMENT ON TABLE public.menu_item_addons IS 'Optional extras/toppings for a menu item';
COMMENT ON TABLE public.allergens IS 'List of allergens (e.g., Dairy, Nuts, Gluten)';
COMMENT ON TABLE public.menu_item_allergens IS 'Join table linking items to allergens';
COMMENT ON TABLE public.tags IS 'Generic tags such as Popular, New, Sugar-Free';
COMMENT ON TABLE public.menu_item_tags IS 'Join table linking items to tags';
COMMENT ON COLUMN public.menu_items.category_id IS 'FK to categories table';
COMMENT ON COLUMN public.menu_items.calories IS 'Optional calorie count';

COMMIT;


