import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await req.json().catch(() => null)
  const endpoint = sub?.endpoint as string | undefined
  const p256dh = sub?.keys?.p256dh as string | undefined
  const authKey = sub?.keys?.auth as string | undefined

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: 'Inscrição inválida' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: user.id, endpoint, p256dh, auth_key: authKey },
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('[push/subscribe]', error)
    return NextResponse.json({ error: 'Erro ao salvar inscrição' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { endpoint } = await req.json().catch(() => ({ endpoint: null }))
  if (!endpoint) return NextResponse.json({ error: 'endpoint obrigatório' }, { status: 400 })

  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)

  return NextResponse.json({ ok: true })
}
