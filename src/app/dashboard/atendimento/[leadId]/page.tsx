'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Lead, Conversation, LeadStatus } from '@/lib/types'
import ChatBubble from '@/components/ChatBubble'

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  qualificado: 'Qualificado',
  fechado: 'Fechado',
  perdido: 'Perdido',
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'var(--teal)',
  em_atendimento: 'var(--orange-brand)',
  qualificado: 'var(--green-dark)',
  fechado: 'var(--purple-dark)',
  perdido: 'var(--mid)',
}

export default function LeadConversationPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [lead, setLead] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [{ data: leadData }, { data: msgs }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', leadId).single(),
      supabase.from('conversations').select('*').eq('lead_id', leadId).order('created_at', { ascending: true }),
    ])
    if (leadData) setLead(leadData as Lead)
    setMessages((msgs ?? []) as Conversation[])
    setLoading(false)
  }, [supabase, leadId])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetchData()
    })
  }, [supabase, router, fetchData])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleTakeover() {
    if (!lead) return
    await supabase.from('leads').update({ bot_active: false }).eq('id', lead.id)
    setLead({ ...lead, bot_active: false })
  }

  async function handleBotReactivate() {
    if (!lead) return
    await supabase.from('leads').update({ bot_active: true }).eq('id', lead.id)
    setLead({ ...lead, bot_active: true })
  }

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead) return
    const updates: Partial<Lead> & { status: LeadStatus } = { status: newStatus }
    await supabase.from('leads').update(updates).eq('id', lead.id)
    setLead({ ...lead, status: newStatus })
  }

  if (loading || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">💬</div>
          <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 sm:px-5 py-3 sticky top-0 z-10"
        style={{ background: '#fff', borderBottom: '1.5px solid var(--border)' }}
      >
        <Link href="/dashboard/atendimento" className="text-xl" style={{ color: 'var(--mid)' }}>←</Link>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm truncate" style={{ color: 'var(--dark)' }}>
            {lead.name ?? lead.phone}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-extrabold px-2 py-0.5 rounded-full"
              style={{ color: STATUS_COLORS[lead.status], background: STATUS_COLORS[lead.status] + '20' }}
            >
              {STATUS_LABELS[lead.status]}
            </span>
            {!lead.bot_active && (
              <span className="text-xs font-bold" style={{ color: 'var(--purple-dark)' }}>👩 modo manual</span>
            )}
          </div>
        </div>
        <button
          onClick={fetchData}
          className="text-sm px-2 py-1 rounded-lg border font-bold"
          style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
        >
          ↻
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 max-w-5xl mx-auto w-full">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4" style={{ minHeight: 0 }}>
            {messages.length === 0 ? (
              <p className="text-center text-sm py-10" style={{ color: 'var(--mid)' }}>
                Nenhuma mensagem ainda
              </p>
            ) : (
              messages.map((m) => <ChatBubble key={m.id} message={m} />)
            )}
            <div ref={bottomRef} />
          </div>

          {/* Bot / manual controls */}
          <div
            className="px-3 sm:px-5 py-3 flex gap-2 flex-wrap"
            style={{ borderTop: '1.5px solid var(--border)', background: '#fff' }}
          >
            {lead.bot_active ? (
              <button
                onClick={handleTakeover}
                className="px-3 py-2 rounded-lg text-xs font-extrabold border"
                style={{ borderColor: 'var(--coral)', color: 'var(--coral)' }}
              >
                Pausar bot e assumir
              </button>
            ) : (
              <button
                onClick={handleBotReactivate}
                className="px-3 py-2 rounded-lg text-xs font-extrabold border"
                style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
              >
                Reativar bot
              </button>
            )}
            <p className="text-xs self-center" style={{ color: 'var(--mid)' }}>
              {lead.bot_active
                ? 'Bot está respondendo automaticamente'
                : 'Bot pausado — responda pelo WhatsApp no celular'}
            </p>
          </div>
        </div>

        {/* Lead info panel */}
        <div
          className="lg:w-72 px-4 py-4 space-y-4 lg:border-l"
          style={{ borderColor: 'var(--border)', background: '#fff' }}
        >
          <h3 className="font-black text-sm" style={{ color: 'var(--dark)' }}>Dados do lead</h3>

          <div className="space-y-2 text-sm">
            {[
              { label: 'Telefone', value: lead.phone },
              { label: 'Tipo de festa', value: lead.event_type },
              { label: 'Data do evento', value: lead.event_date ? new Date(lead.event_date).toLocaleDateString('pt-BR') : null },
              { label: 'Convidados', value: lead.guest_count?.toString() },
              { label: 'Local', value: lead.venue },
              { label: 'Orçamento', value: lead.budget_range },
              { label: 'Tema/cores', value: lead.theme_notes },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ color: value ? 'var(--dark)' : 'var(--border)' }}>
                  {value ?? '—'}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase mb-2" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>Status</p>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="text-left px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all"
                  style={{
                    borderColor: lead.status === s ? STATUS_COLORS[s] : 'var(--border)',
                    background: lead.status === s ? STATUS_COLORS[s] + '15' : 'transparent',
                    color: lead.status === s ? STATUS_COLORS[s] : 'var(--mid)',
                  }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
