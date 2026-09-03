-- Inscrições de push notification do PWA (Web Push / VAPID).
-- Uma linha por dispositivo/navegador inscrito, vinculada ao usuário autenticado do dashboard.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "usuário gerencia suas próprias inscrições"
  on push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
