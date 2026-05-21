'use client'

import { Lead, LeadStatus } from '@/lib/types'

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  novo: { label: 'Novo', color: 'var(--teal)', bg: 'var(--teal-l)' },
  em_atendimento: { label: 'Em atendimento', color: 'var(--orange-brand)', bg: 'var(--orange-l)' },
  qualificado: { label: 'Qualificado', color: 'var(--green-dark)', bg: 'var(--green-l)' },
  fechado: { label: 'Fechado', color: 'var(--purple-dark)', bg: 'var(--purple-l)' },
  perdido: { label: 'Perdido', color: 'var(--mid)', bg: 'var(--border)' },
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  lead: Lead
  onClick: () => void
}

export default function LeadCard({ lead, onClick }: Props) {
  const cfg = STATUS_CONFIG[lead.status]
  const displayName = lead.name ?? lead.phone

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-xl border transition-all hover:shadow-md"
      style={{ background: '#fff', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm truncate" style={{ color: 'var(--dark)' }}>
            {displayName}
          </p>
          {lead.event_type && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--mid)' }}>
              {lead.event_type}
              {lead.event_date ? ` · ${new Date(lead.event_date).toLocaleDateString('pt-BR')}` : ''}
              {lead.guest_count ? ` · ${lead.guest_count} convidados` : ''}
            </p>
          )}
          {lead.theme_notes && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--mid)' }}>
              {lead.theme_notes}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-extrabold"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.label}
          </span>
          {!lead.bot_active && (
            <span className="text-xs font-bold" style={{ color: 'var(--purple-dark)' }}>
              👩 Flávia
            </span>
          )}
        </div>
      </div>
      <p className="text-xs mt-1.5" style={{ color: 'var(--light)' }}>
        {formatDate(lead.last_message_at ?? lead.created_at)}
      </p>
    </button>
  )
}
