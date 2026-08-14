-- Migration 011: busca tolerante a erro de digitação (ex: "minie" encontra
-- "Minnie") via pg_trgm (similaridade de trigramas), em vez de só
-- substring exata (ILIKE).

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_inventory_items_name_trgm
  ON public.inventory_items USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_inventory_items_description_trgm
  ON public.inventory_items USING gin (description gin_trgm_ops);

CREATE OR REPLACE FUNCTION public.search_inventory_items(search_term text)
RETURNS SETOF public.inventory_items
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.inventory_items
  WHERE active = true
    AND (
      name ILIKE '%' || search_term || '%'
      OR description ILIKE '%' || search_term || '%'
      OR similarity(name, search_term) > 0.25
      OR (description IS NOT NULL AND similarity(description, search_term) > 0.25)
    )
  ORDER BY GREATEST(
    similarity(name, search_term),
    similarity(coalesce(description, ''), search_term)
  ) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.search_inventory_items(text) TO anon, authenticated;
