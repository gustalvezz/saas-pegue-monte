-- Migration 010: tags de tema (personagens/franquias) — usadas como palavras
-- de busca de alto volume ("decoração festa toy story", "homem aranha"...).
-- Reaproveita a tabela tag_options que já existe (sem mudança de schema).

INSERT INTO public.tag_options (name, slug) VALUES
  ('Hotwheels', 'hotwheels'),
  ('Princesas', 'princesas'),
  ('Dinossauros', 'dinossauros'),
  ('Frozen', 'frozen'),
  ('Barbie', 'barbie'),
  ('Super-heróis', 'super-herois'),
  ('Homem-Aranha', 'homem-aranha'),
  ('Toy Story', 'toy-story'),
  ('Unicórnio', 'unicornio'),
  ('Safári', 'safari')
ON CONFLICT (slug) DO NOTHING;
