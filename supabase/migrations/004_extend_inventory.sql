-- Migration 004: Renomear catalog_items → inventory_items e adicionar campos de inventário

ALTER TABLE public.catalog_items RENAME TO inventory_items;

-- Atualizar policies
ALTER POLICY "Authenticated full access" ON public.inventory_items RENAME TO "Authenticated full access";
ALTER POLICY "Public read active items" ON public.inventory_items RENAME TO "Public read active items";

-- Novos campos de inventário físico
ALTER TABLE public.inventory_items
  ADD COLUMN color             text,
  ADD COLUMN size_description  text,
  ADD COLUMN material          text CHECK (material IN (
    'ceramica', 'plastico', 'mdf', 'acrilico', 'led', 'tecido', 'lona', 'outros'
  )),
  ADD COLUMN quantity_total    int NOT NULL DEFAULT 1 CHECK (quantity_total > 0),
  ADD COLUMN replacement_price numeric(10, 2) CHECK (replacement_price >= 0),
  ADD COLUMN rental_price_unit numeric(10, 2) CHECK (rental_price_unit >= 0);

-- Recriar índice com novo nome
DROP INDEX IF EXISTS catalog_category_idx;
CREATE INDEX IF NOT EXISTS inventory_category_idx ON public.inventory_items (category, active);
CREATE INDEX IF NOT EXISTS inventory_material_idx  ON public.inventory_items (material);
