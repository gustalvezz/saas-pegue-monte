-- Migration 013: corrige sensibilidade a maiúsculas/minúsculas na busca.
-- word_similarity() do pg_trgm é case-sensitive — "minie" x "Minnie" perdia
-- trigramas só por causa do "M" maiúsculo, ficando abaixo do limite mesmo
-- sendo uma correspondência óbvia. Comparando tudo em minúsculo resolve.

-- Índices antigos (migration 011) eram sobre a coluna crua; como a função
-- agora compara lower(name)/lower(description), troca por índices sobre a
-- expressão em minúsculo para continuar usando o índice.
DROP INDEX IF EXISTS public.idx_inventory_items_name_trgm;
DROP INDEX IF EXISTS public.idx_inventory_items_description_trgm;
CREATE INDEX IF NOT EXISTS idx_inventory_items_name_lower_trgm
  ON public.inventory_items USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_inventory_items_description_lower_trgm
  ON public.inventory_items USING gin (lower(description) gin_trgm_ops);

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
      OR word_similarity(lower(search_term), lower(name)) > 0.3
      OR (description IS NOT NULL AND word_similarity(lower(search_term), lower(description)) > 0.3)
    )
  ORDER BY GREATEST(
    word_similarity(lower(search_term), lower(name)),
    word_similarity(lower(search_term), lower(coalesce(description, '')))
  ) DESC;
$$;
