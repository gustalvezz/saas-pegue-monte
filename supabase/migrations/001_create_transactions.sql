-- Tabela de transações financeiras
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  description text not null,
  type        text not null check (type in ('receita', 'despesa')),
  category    text not null check (
    category in ('Locação', 'Devolução', 'Compra de Decoração', 'Fatura Cartão', 'Outros')
  ),
  value       numeric(10, 2) not null check (value > 0),
  created_at  timestamptz not null default now()
);

-- RLS: each authenticated user only sees their own rows would require user_id.
-- For a single-user SaaS, we enable auth restriction at the policy level.
alter table public.transactions enable row level security;

-- Allow authenticated users full access
create policy "Authenticated full access"
  on public.transactions
  for all
  to authenticated
  using (true)
  with check (true);

-- Index for common queries
create index if not exists transactions_date_idx on public.transactions (date desc);
create index if not exists transactions_type_idx on public.transactions (type);
