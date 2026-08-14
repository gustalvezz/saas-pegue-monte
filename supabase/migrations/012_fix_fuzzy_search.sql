-- Migration 012: corrige a busca fuzzy — similarity() compara a string
-- inteira (nome do item) contra o termo buscado, o que dá pontuação baixa
-- quando o termo é só uma palavra dentro de um nome com várias palavras
-- ("Kit Minnie Mouse Rosa" vs "minie"). word_similarity() é a função certa
-- pra "essa palavra aparece em algum trecho desse texto maior".

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
      OR word_similarity(search_term, name) > 0.3
      OR (description IS NOT NULL AND word_similarity(search_term, description) > 0.3)
    )
  ORDER BY GREATEST(
    word_similarity(search_term, name),
    word_similarity(search_term, coalesce(description, ''))
  ) DESC;
$$;
