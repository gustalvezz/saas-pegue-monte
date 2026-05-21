-- Tabela de itens do catálogo de decorações
create table if not exists public.catalog_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  category    text not null check (
    category in ('aniversário', 'casamento', 'chá_bebê', 'debutante', 'outros')
  ),
  tags        text[] not null default '{}',
  image_url   text not null,
  active      bool not null default true,
  created_at  timestamptz not null default now()
);

alter table public.catalog_items enable row level security;

create policy "Authenticated full access"
  on public.catalog_items
  for all
  to authenticated
  using (true)
  with check (true);

-- Public read access for catalog (bot can query without auth context in edge fn if needed)
create policy "Public read active items"
  on public.catalog_items
  for select
  to anon
  using (active = true);

create index if not exists catalog_category_idx on public.catalog_items (category, active);
