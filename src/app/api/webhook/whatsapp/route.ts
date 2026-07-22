import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export const maxDuration = 60
import { sendText, sendImage } from '@/lib/evolution-api'
import { generateBotResponse } from '@/lib/chatbot'
import { findRelevantItems } from '@/lib/catalog'
import { Lead, Conversation, EventType, BudgetRange } from '@/lib/types'

// Evolution API webhook payload types
interface EvolutionMessage {
  key: { remoteJid: string; fromMe: boolean; id: string }
  message?: { conversation?: string; extendedTextMessage?: { text: string } }
  messageType: string
}

interface EvolutionWebhookPayload {
  event: string
  instance: string
  data: EvolutionMessage
}

function extractPhone(remoteJid: string): string {
  return remoteJid.replace(/@s\.whatsapp\.net$/, '').replace(/@.*$/, '')
}

function extractText(msg: EvolutionMessage): string | null {
  return (
    msg.message?.conversation ??
    msg.message?.extendedTextMessage?.text ??
    null
  )
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.EVOLUTION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.EVOLUTION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let payload: EvolutionWebhookPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (payload.event !== 'messages.upsert') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const msg = payload.data
  const phone = extractPhone(msg.key.remoteJid)

  // Skip group messages and status broadcasts
  if (msg.key.remoteJid.includes('@g.us') || msg.key.remoteJid === 'status@broadcast') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const supabase = createAdminClient()
  const messageText = extractText(msg)

  // Upsert lead
  let { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('phone', phone)
    .single()

  if (!lead) {
    const { data: newLead } = await supabase
      .from('leads')
      .insert({ phone, status: 'novo', bot_active: true })
      .select()
      .single()
    lead = newLead
  }

  if (!lead) return NextResponse.json({ error: 'lead creation failed' }, { status: 500 })

  // If message is from Flávia's own device, disable bot for this lead
  if (msg.key.fromMe) {
    await supabase
      .from('leads')
      .update({ bot_active: false, last_message_at: new Date().toISOString() })
      .eq('id', lead.id)

    if (messageText) {
      await supabase.from('conversations').insert({
        lead_id: lead.id,
        direction: 'outbound',
        message_text: messageText,
        wa_message_id: msg.key.id,
      })
    }
    return NextResponse.json({ ok: true, action: 'takeover_detected' })
  }

  // Save inbound message (ignore if no text — media-only messages)
  if (!messageText) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // Deduplicate
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('wa_message_id', msg.key.id)
    .single()
  if (existing) return NextResponse.json({ ok: true, skipped: true })

  await supabase.from('conversations').insert({
    lead_id: lead.id,
    direction: 'inbound',
    message_text: messageText,
    wa_message_id: msg.key.id,
  })

  await supabase
    .from('leads')
    .update({ status: 'em_atendimento', last_message_at: new Date().toISOString() })
    .eq('id', lead.id)

  // If bot is disabled, don't auto-reply
  if (!lead.bot_active) {
    return NextResponse.json({ ok: true, action: 'human_handling' })
  }

  // Fetch conversation history
  const { data: history } = await supabase
    .from('conversations')
    .select('*')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: true })
    .limit(20)

  const { message, leadData, qualified, suggestCatalog } = await generateBotResponse(
    lead as Lead,
    (history ?? []) as Conversation[],
    messageText
  )

  // Update lead with extracted data
  const updatePayload: Partial<Lead> & { status?: string } = {}
  if (leadData) {
    if (leadData.name) updatePayload.name = leadData.name
    if (leadData.event_type) updatePayload.event_type = leadData.event_type as EventType
    if (leadData.event_date) updatePayload.event_date = leadData.event_date
    if (leadData.guest_count) updatePayload.guest_count = leadData.guest_count
    if (leadData.venue) updatePayload.venue = leadData.venue
    if (leadData.theme_notes) updatePayload.theme_notes = leadData.theme_notes
    if (leadData.budget_range) updatePayload.budget_range = leadData.budget_range as BudgetRange
  }
  if (qualified) updatePayload.status = 'qualificado'

  if (Object.keys(updatePayload).length > 0) {
    await supabase.from('leads').update(updatePayload).eq('id', lead.id)
  }

  // Send bot reply
  await sendText(phone, message)

  // Save outbound message
  await supabase.from('conversations').insert({
    lead_id: lead.id,
    direction: 'outbound',
    message_text: message,
  })

  // If we have enough context, send catalog photos
  if (suggestCatalog) {
    const category = (leadData?.event_type ?? lead.event_type) as import('@/lib/types').CatalogCategory | null
    const themeNotes = leadData?.theme_notes ?? lead.theme_notes ?? ''
    const tags = themeNotes.toLowerCase().split(/[\s,]+/).filter(Boolean)

    const items = await findRelevantItems(category, tags)
    for (const item of items.slice(0, 2)) {
      try {
        await sendImage(phone, item.image_url, item.name)
        await supabase.from('conversations').insert({
          lead_id: lead.id,
          direction: 'outbound',
          message_text: item.name,
          media_url: item.image_url,
        })
      } catch {
        // Non-fatal: catalog photo send failure
      }
    }
  }

  return NextResponse.json({ ok: true })
}
