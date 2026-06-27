import type { SupabaseClient } from '@supabase/supabase-js'
import { DecoraEvent } from '@/lib/types'

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

async function refreshAccessToken(token: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: token,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

/** Returns a valid access token for userId, refreshing if expiring soon */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getValidToken(supabase: SupabaseClient<any>, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('google_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (!data) return null

  const expiresAt = new Date(data.expires_at).getTime()
  const needsRefresh = expiresAt - Date.now() < 5 * 60 * 1000

  if (!needsRefresh) return data.access_token as string

  try {
    const { access_token, expires_in } = await refreshAccessToken(data.refresh_token as string)
    await supabase
      .from('google_tokens')
      .update({
        access_token,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
    return access_token
  } catch {
    return null
  }
}

function toGoogleEvent(ev: DecoraEvent) {
  const description = [
    ev.event_type ? `Tipo: ${ev.event_type}` : null,
    ev.guest_count ? `Convidados: ${ev.guest_count}` : null,
    ev.venue ? `Local: ${ev.venue}` : null,
    ev.theme_notes ? `Tema: ${ev.theme_notes}` : null,
    ev.client_phone ? `Telefone: ${ev.client_phone}` : null,
    '',
    `📦 Retirada: ${ev.pickup_date}`,
    `📦 Devolução: ${ev.return_date}`,
    '',
    'Criado via Decora Festa',
  ].filter((l) => l !== null).join('\n')

  return {
    summary: `🎉 ${ev.client_name}${ev.event_type ? ` · ${ev.event_type}` : ''}`,
    description,
    location: ev.venue ?? undefined,
    start: { date: ev.event_date },
    end: { date: ev.event_date },
  }
}

export async function createGoogleEvent(accessToken: string, ev: DecoraEvent): Promise<string> {
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(toGoogleEvent(ev)),
  })
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return json.id as string
}

export async function updateGoogleEvent(accessToken: string, googleEventId: string, ev: DecoraEvent): Promise<void> {
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events/${googleEventId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(toGoogleEvent(ev)),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function deleteGoogleEvent(accessToken: string, googleEventId: string): Promise<void> {
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events/${googleEventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  // 404/410 = already gone, that's fine
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Delete failed: ${res.status}`)
  }
}
