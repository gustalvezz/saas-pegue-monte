import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { extractOrderFromConversation } from '@/lib/order-extraction'
import { sendPushToAll } from '@/lib/push'
import { Conversation, Lead } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: NextRequest, { params }: { params: { leadId: string } }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: lead } = await supabase.from('leads').select('*').eq('id', params.leadId).single()
  if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })

  const { data: messages } = await supabase
    .from('conversations')
    .select('*')
    .eq('lead_id', params.leadId)
    .order('created_at', { ascending: true })

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'Essa conversa ainda não tem mensagens' }, { status: 400 })
  }

  const transcript = (messages as Conversation[])
    .map((m) => `${m.direction === 'inbound' ? 'Cliente' : 'Flávia'}: ${m.message_text ?? '[mídia]'}`)
    .join('\n')

  let extracted
  try {
    extracted = await extractOrderFromConversation(transcript)
  } catch (err) {
    console.error('[extract-order]', err)
    return NextResponse.json({ error: 'Erro ao processar a conversa com a IA' }, { status: 500 })
  }

  if (!extracted) {
    return NextResponse.json({ error: 'Não consegui extrair dados suficientes dessa conversa' }, { status: 422 })
  }

  const leadTyped = lead as Lead
  const today = new Date().toISOString().slice(0, 10)
  const eventDate = extracted.event_date || today

  const { data: newEvent, error: insErr } = await supabase
    .from('events')
    .insert({
      lead_id: leadTyped.id,
      client_name: extracted.client_name || leadTyped.name || leadTyped.phone,
      client_phone: leadTyped.phone,
      event_type: extracted.event_type,
      event_date: eventDate,
      pickup_date: eventDate,
      return_date: eventDate,
      venue: extracted.venue,
      theme_notes: extracted.theme_notes,
      guest_count: extracted.guest_count,
      status: 'cotacao',
    })
    .select()
    .single()

  if (insErr || !newEvent) {
    console.error('[extract-order] insert event', insErr)
    return NextResponse.json({ error: 'Erro ao criar o rascunho do pedido' }, { status: 500 })
  }

  // Confere preço real de cada item extraído direto no banco — nunca confia
  // no valor que a IA possa ter carregado, só no id (que já veio da busca real)
  if (extracted.items.length > 0) {
    const itemIds = extracted.items.map((i) => i.item_id)
    const { data: priceLookup } = await supabase
      .from('inventory_items')
      .select('id, rental_price_unit')
      .in('id', itemIds)
    const priceMap = new Map((priceLookup ?? []).map((p) => [p.id, p.rental_price_unit ?? 0]))

    const validItems = extracted.items.filter((item) => priceMap.has(item.item_id) && item.quantity > 0)
    if (validItems.length > 0) {
      await supabase.from('event_items').insert(
        validItems.map((item) => ({
          event_id: newEvent.id,
          inventory_item_id: item.item_id,
          quantity: item.quantity,
          unit_price: priceMap.get(item.item_id)!,
        }))
      )
    }
  }

  await sendPushToAll({
    title: '✨ Rascunho de pedido pronto',
    body: `${newEvent.client_name} — revise a cotação montada a partir da conversa`,
    url: `/dashboard/eventos/${newEvent.id}`,
  })

  return NextResponse.json({ ok: true, eventId: newEvent.id, missingFields: extracted.missing_fields })
}
