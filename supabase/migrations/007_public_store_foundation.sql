-- Migration 007: Fundação da Loja Pública
-- Categorias por tipo de produto, tags pré-cadastradas, kits, clientes e
-- campos de contrato em events. Leitura pública liberada para o catálogo.

CREATE EXTENSION IF NOT EXISTS unaccent;

-- Categorias (tipo de produto — navegação da loja)
CREATE TABLE public.categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read access" ON public.categories
  FOR SELECT TO anon USING (true);

INSERT INTO public.categories (name, slug) VALUES
  ('Pegue e Monte', 'pegue-e-monte'),
  ('Balões', 'baloes'),
  ('Mesas', 'mesas'),
  ('Painéis e Estruturas', 'paineis-e-estruturas'),
  ('Vasos', 'vasos'),
  ('Boleiras e Doceiras', 'boleiras-e-doceiras'),
  ('Bandejas e Suportes para Doces', 'bandejas-e-suportes-para-doces'),
  ('Tapetes', 'tapetes'),
  ('Objetos Decorativos', 'objetos-decorativos'),
  ('Outros', 'outros');

-- Tags pré-cadastradas (ocasião / público-alvo)
CREATE TABLE public.tag_options (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tag_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.tag_options
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read access" ON public.tag_options
  FOR SELECT TO anon USING (true);

INSERT INTO public.tag_options (name, slug) VALUES
  ('Infantil', 'infantil'),
  ('Menina', 'menina'),
  ('Menino', 'menino'),
  ('Adulto', 'adulto'),
  ('Aniversário', 'aniversario'),
  ('Casamento', 'casamento'),
  ('Chá de Bebê', 'cha-de-bebe'),
  ('Debutante / 15 Anos', 'debutante-15-anos'),
  ('Batizado', 'batizado'),
  ('Formatura', 'formatura');

-- Itens de inventário: categoria por produto (substitui o enum de tipo de
-- festa como categoria), slug para URL indexável, marcação de kit
ALTER TABLE public.inventory_items
  ADD COLUMN category_id uuid REFERENCES public.categories(id),
  ADD COLUMN slug        text UNIQUE,
  ADD COLUMN is_kit      boolean NOT NULL DEFAULT false;

UPDATE public.inventory_items
SET slug = lower(regexp_replace(regexp_replace(unaccent(name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
           || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL;

-- Componentes de um kit ("conteúdo do kit")
CREATE TABLE public.kit_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id             uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  component_item_id  uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity           int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kit_id, component_item_id)
);
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.kit_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read access" ON public.kit_items
  FOR SELECT TO anon USING (true);

-- Clientes da loja pública (dados para gerar o contrato)
CREATE TABLE public.customers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  cpf             text NOT NULL,
  rg              text,
  phone           text NOT NULL,
  email           text NOT NULL,
  address         text NOT NULL,
  reference_name  text,
  reference_phone text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Sem policy pública: pedidos da loja são criados via API route com o
-- cliente admin (service role), não por escrita direta do navegador.

-- Campos de contrato em events (frete, sinal, tipo de espaço, horários)
ALTER TABLE public.events
  ADD COLUMN customer_id         uuid REFERENCES public.customers(id),
  ADD COLUMN pickup_time         time,
  ADD COLUMN return_deadline_time time,
  ADD COLUMN space_type          text CHECK (space_type IN ('interno', 'externo', 'misto')),
  ADD COLUMN delivery_fee        numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN return_shipping     text CHECK (return_shipping IN ('locataria', 'locadora', 'retirada_locadora')),
  ADD COLUMN deposit_amount      numeric(10,2);

-- Contratos gerados (PDF + assinatura eletrônica simples)
CREATE TABLE public.contracts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  pdf_url              text,
  signature_image_url  text,
  signer_ip            text,
  signer_user_agent    text,
  signed_at            timestamptz,
  sign_token           text UNIQUE,
  created_at           timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access" ON public.contracts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Leitura pública de itens ativos (catálogo da loja)
CREATE POLICY "Public read active items" ON public.inventory_items
  FOR SELECT TO anon USING (active = true);
