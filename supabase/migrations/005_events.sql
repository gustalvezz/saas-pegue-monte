-- Migration 005: Tabelas events e event_items

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references public.leads(id) on delete set null,
  client_name  text not null,
  client_phone text,
  event_type   text check (
    event_type in ('aniversário', 'casamento', 'chá_bebê', 'debutante', 'outros')
  ),
  event_date   date not null,
  pickup_date  date not null,
  return_date  date not null,
  venue        text,
  theme_notes  text,
  guest_count  int,
  status       text not null default 'cotacao' check (
    status in ('cotacao', 'confirmado', 'em_andamento', 'concluido', 'cancelado')
  ),
  notes        text,
  created_at   timestamptz not null default now(),
  constraint pickup_before_return check (pickup_date <= return_date),
  constraint pickup_before_or_on_event check (pickup_date <= event_date),
  constraint event_before_or_on_return check (event_date <= return_date)
);

alter table public.events enable row level security;

create policy "Authenticated full access"
  on public.events for all to authenticated
  using (true) with check (true);

create index if not exists events_event_date_idx  on public.events (event_date);
create index if not exists events_status_idx      on public.events (status);
create index if not exists events_pickup_idx      on public.events (pickup_date, return_date);

-- Itens alocados por evento
create table if not exists public.event_items (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references public.events(id) on delete cascade,
  inventory_item_id   uuid not null references public.inventory_items(id),
  quantity            int not null check (quantity > 0),
  unit_price          numeric(10, 2) not null check (unit_price >= 0),
  created_at          timestamptz not null default now(),
  unique (event_id, inventory_item_id)
);

alter table public.event_items enable row level security;

create policy "Authenticated full access"
  on public.event_items for all to authenticated
  using (true) with check (true);

create index if not exists event_items_event_idx on public.event_items (event_id);
create index if not exists event_items_item_idx  on public.event_items (inventory_item_id);
