'use client'

import { DecoraEvent, EventStatus } from '@/lib/types'

const STATUS_CFG: Record<EventStatus, { label: string; color: string; bg: string }> = {
  cotacao:     { label: 'Cotação',      color: 'var(--mid)',          bg: 'var(--border)' },
  confirmado:  { label: 'Confirmado',   color: 'var(--teal-d)',       bg: 'var(--teal-l)' },
  em_andamento:{ label: 'Em andamento', color: 'var(--orange-brand)', bg: 'var(--orange-l)' },
  concluido:   { label: 'Concluído',    color: 'var(--green-dark)',   bg: 'var(--green-l)' },
  cancelado:   { label: 'Cancelado',    color: 'var(--coral)',        bg: 'var(--coral-l)' },
}

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

interface Props {
  event: DecoraEvent
  onClick: () => void
}

export default function EventCard({ event, onClick }: Props) {
  const cfg = STATUS_CFG[event.status]

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-xl border transition-all hover:shadow-md"
      style={{ background: '#fff', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm truncate" style={{ color: 'var(--dark)' }}>
            {event.client_name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mid)' }}>
            🎉 {fmt(event.event_date)}
            {event.event_type ? ` · ${event.event_type}` : ''}
            {event.venue ? ` · ${event.venue}` : ''}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--light)' }}>
            Retirada {fmt(event.pickup_date)} → Devolução {fmt(event.return_date)}
          </p>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-extrabold flex-shrink-0"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>
    </button>
  )
}
