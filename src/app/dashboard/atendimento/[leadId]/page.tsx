'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Lead, Conversation, LeadStatus, EventType, BudgetRange } from '@/lib/types'
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

const EVENT_TYPES: EventType[] = ['aniversário', 'casamento', 'chá_bebê', 'debutante', 'outros']
const BUDGET_RANGES: BudgetRange[] = ['até R$500', 'R$500-R$1000', 'R$1000-R$2000', 'R$2000+']

export default function LeadConversationPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.leadId as string
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [lead, setLead] = useState<Lead | null>(null)
  const [messages, setMessages] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // Formulário de edição dos dados do lead
  const [fName, setFName] = useState('')
  const [fEventType, setFEventType] = useState<EventType | ''>('')
  const [fEventDate, setFEventDate] = useState('')
  const [fGuestCount, setFGuestCount] = useState('')
  const [fVenue, setFVenue] = useState('')
  const [fBudgetRange, setFBudgetRange] = useState<BudgetRange | ''>('')
  const [fThemeNotes, setFThemeNotes] = useState('')

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

  function openEditLead() {
    if (!lead) return
    setFName(lead.name ?? '')
    setFEventType(lead.event_type ?? '')
    setFEventDate(lead.event_date ?? '')
    setFGuestCount(lead.guest_count?.toString() ?? '')
    setFVenue(lead.venue ?? '')
    setFBudgetRange(lead.budget_range ?? '')
    setFThemeNotes(lead.theme_notes ?? '')
    setEditMode(true)
  }

  async function handleSaveLead() {
    if (!lead) return
    setSaving(true)
    const updates: Partial<Lead> = {
      name: fName.trim() || null,
      event_type: fEventType || null,
      event_date: fEventDate || null,
      guest_count: fGuestCount ? parseInt(fGuestCount) : null,
      venue: fVenue.trim() || null,
      budget_range: fBudgetRange || null,
      theme_notes: fThemeNotes.trim() || null,
    }
    await supabase.from('leads').update(updates).eq('id', lead.id)
    setLead({ ...lead, ...updates })
    setSaving(false)
    setEditMode(false)
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
        <div className="flex items-center gap-1.5">
          {(lead.status === 'qualificado' || lead.status === 'fechado') && (
            <button
              onClick={() => {
                const p = new URLSearchParams({
                  client_name: lead.name ?? '',
                  client_phone: lead.phone ?? '',
                  event_type: lead.event_type ?? '',
                  event_date: lead.event_date ?? '',
                  venue: lead.venue ?? '',
                  theme_notes: lead.theme_notes ?? '',
                  guest_count: lead.guest_count?.toString() ?? '',
                })
                router.push(`/dashboard/eventos/novo?${p.toString()}`)
              }}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-extrabold"
              style={{ background: 'var(--purple-dark)' }}
            >
              🎉 Criar Evento
            </button>
          )}
          <button
            onClick={fetchData}
            className="text-sm px-2 py-1 rounded-lg border font-bold"
            style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
          >
            ↻
          </button>
        </div>
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
          className="lg:w-72 px-4 py-4 space-y-4 lg:border-l overflow-y-auto"
          style={{ borderColor: 'var(--border)', background: '#fff' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm" style={{ color: 'var(--dark)' }}>Dados do lead</h3>
            {!editMode && (
              <button
                onClick={openEditLead}
                className="px-2.5 py-1 rounded-lg border text-xs font-bold"
                style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
              >
                Editar
              </button>
            )}
          </div>

          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="field-label">Nome</label>
                <input className="field-input" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Nome do cliente" />
              </div>
              <div>
                <label className="field-label">Telefone</label>
                <input className="field-input" value={lead.phone} disabled style={{ opacity: 0.6 }} />
                <p className="text-xs mt-1" style={{ color: 'var(--light)' }}>Vinculado à conversa do WhatsApp — não pode ser alterado aqui.</p>
              </div>
              <div>
                <label className="field-label">Tipo de festa</label>
                <select className="field-input" value={fEventType} onChange={(e) => setFEventType(e.target.value as EventType | '')}>
                  <option value="">—</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Data do evento</label>
                <input type="date" className="field-input" value={fEventDate} onChange={(e) => setFEventDate(e.target.value)} />
              </div>
              <div>
                <label className="field-label">Convidados</label>
                <input type="number" min={0} className="field-input" value={fGuestCount} onChange={(e) => setFGuestCount(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="field-label">Local</label>
                <input className="field-input" value={fVenue} onChange={(e) => setFVenue(e.target.value)} placeholder="Casa, salão, sítio…" />
              </div>
              <div>
                <label className="field-label">Orçamento</label>
                <select className="field-input" value={fBudgetRange} onChange={(e) => setFBudgetRange(e.target.value as BudgetRange | '')}>
                  <option value="">—</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Tema/cores</label>
                <textarea className="field-input" rows={2} value={fThemeNotes} onChange={(e) => setFThemeNotes(e.target.value)} placeholder="Tema, cores, referências…" />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveLead}
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg text-white text-xs font-extrabold disabled:opacity-60"
                  style={{ background: 'var(--teal)' }}
                >
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-3 py-2 rounded-lg border text-xs font-bold"
                  style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                { label: 'Nome', value: lead.name },
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
          )}

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
