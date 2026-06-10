'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { DecoraEvent, EventStatus } from '@/lib/types'
import EventCard from '@/components/EventCard'

const STATUS_TABS: { key: EventStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'cotacao', label: 'Cotação' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'em_andamento', label: 'Em andamento' },
  { key: 'concluido', label: 'Concluído' },
  { key: 'cancelado', label: 'Cancelado' },
]

export default function EventosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [events, setEvents] = useState<DecoraEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<EventStatus | 'todos'>('todos')

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    setEvents((data ?? []) as DecoraEvent[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetchEvents()
    })
  }, [supabase, router, fetchEvents])

  const filtered = tab === 'todos' ? events : events.filter((e) => e.status === tab)

  const hoje = new Date().toISOString().split('T')[0]
  const proximos7 = events.filter((e) => e.event_date >= hoje && e.event_date <= (() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]
  })() && e.status !== 'cancelado').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-4xl animate-bounce">🎉</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-lg" style={{ color: 'var(--mid)' }}>←</Link>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--purple-dark), var(--teal))' }}
          >
            🎉
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--dark)' }}>
              Decora Festa <span style={{ color: 'var(--purple-dark)' }}>· Eventos</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--mid)' }}>
              {proximos7} festa{proximos7 !== 1 ? 's' : ''} nos próximos 7 dias
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/eventos/novo')}
            className="px-3 py-2 rounded-xl text-white text-sm font-extrabold"
            style={{ background: 'var(--purple-dark)' }}
          >
            + Novo
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Confirmados', value: events.filter((e) => e.status === 'confirmado').length, color: 'var(--teal-d)' },
            { label: 'Em andamento', value: events.filter((e) => e.status === 'em_andamento').length, color: 'var(--orange-brand)' },
            { label: 'Concluídos', value: events.filter((e) => e.status === 'concluido').length, color: 'var(--green-dark)' },
          ].map((k) => (
            <div key={k.label} className="rounded-xl p-3 text-center" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
              <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs leading-tight mt-0.5" style={{ color: 'var(--mid)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {STATUS_TABS.map((t) => {
            const count = t.key === 'todos' ? events.length : events.filter((e) => e.status === t.key).length
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-3 py-1 rounded-full border text-xs font-extrabold transition-all"
                style={{
                  borderColor: active ? 'var(--purple-dark)' : 'var(--border)',
                  background: active ? 'var(--purple-dark)' : 'transparent',
                  color: active ? '#fff' : 'var(--mid)',
                }}
              >
                {t.label} ({count})
              </button>
            )
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Nenhum evento aqui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => router.push(`/dashboard/eventos/${event.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
