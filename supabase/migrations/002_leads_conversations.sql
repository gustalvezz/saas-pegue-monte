-- Tabela de leads (potenciais clientes do WhatsApp)
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  phone           text unique not null,
  name            text,
  status          text not null default 'novo' check (
    status in ('novo', 'em_atendimento', 'qualificado', 'fechado', 'perdido')
  ),
  event_type      text check (
    event_type in ('aniversário', 'casamento', 'chá_bebê', 'debutante', 'outros')
  ),
  event_date      date,
  guest_count     int,
  venue           text,
  budget_range    text check (
    budget_range in ('até R$500', 'R$500-R$1000', 'R$1000-R$2000', 'R$2000+')
  ),
  theme_notes     text,
  bot_active      bool not null default true,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz
);

alter table public.leads enable row level security;

create policy "Authenticated full access"
  on public.leads
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_last_message_idx on public.leads (last_message_at desc nulls last);

-- Tabela de mensagens de conversa WhatsApp
create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references public.leads(id) on delete cascade,
  direction     text not null check (direction in ('inbound', 'outbound')),
  message_text  text,
  media_url     text,
  wa_message_id text unique,
  created_at    timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Authenticated full access"
  on public.conversations
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists conversations_lead_idx on public.conversations (lead_id, created_at asc);
