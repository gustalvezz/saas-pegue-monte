-- Migration 006: tokens OAuth do Google + campo google_event_id nos eventos

-- Tabela de tokens OAuth do Google (um por usuário autenticado)
CREATE TABLE public.google_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token  text NOT NULL,
  refresh_token text NOT NULL,
  expires_at    timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own google tokens"
  ON public.google_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ID do evento no Google Calendar para rastrear eventos sincronizados
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS google_event_id text;
