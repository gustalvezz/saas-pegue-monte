import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getValidToken, createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } from '@/lib/google-calendar'
import { DecoraEvent } from '@/lib/types'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId, action } = (await req.json()) as { eventId: string; action: 'upsert' | 'delete' }

  const accessToken = await getValidToken(supabase, user.id)
  if (!accessToken) {
    // Google not connected — silently skip
    return NextResponse.json({ ok: false, reason: 'no_google_token' })
  }

  const { data: ev } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const event = ev as DecoraEvent & { google_event_id: string | null }

  try {
    if (action === 'delete') {
      if (event.google_event_id) {
        await deleteGoogleEvent(accessToken, event.google_event_id)
        await supabase.from('events').update({ google_event_id: null }).eq('id', eventId)
      }
    } else {
      if (event.google_event_id) {
        await updateGoogleEvent(accessToken, event.google_event_id, event)
      } else {
        const googleEventId = await createGoogleEvent(accessToken, event)
        await supabase.from('events').update({ google_event_id: googleEventId }).eq('id', eventId)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[calendar/sync]', err)
    return NextResponse.json({ ok: false, reason: 'sync_failed' }, { status: 500 })
  }
}
