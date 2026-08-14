-- Migration 009: imagens do carrossel do hero da loja pública, gerenciadas
-- pela Flávia no dashboard.

CREATE TABLE public.hero_images (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url      text NOT NULL,
  display_order  int NOT NULL DEFAULT 0,
  active         boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.hero_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read access" ON public.hero_images
  FOR SELECT TO anon USING (active = true);
