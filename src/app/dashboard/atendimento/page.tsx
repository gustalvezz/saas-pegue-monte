'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Lead, LeadStatus } from '@/lib/types'
import LeadCard from '@/components/LeadCard'

const STATUS_TABS: { key: LeadStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'novo', label: 'Novos' },
  { key: 'em_atendimento', label: 'Em atendimento' },
  { key: 'qualificado', label: 'Qualificados' },
  { key: 'fechado', label: 'Fechados' },
  { key: 'perdido', label: 'Perdidos' },
]

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function AtendimentoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<LeadStatus | 'todos'>('todos')

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false })
    setLeads((data ?? []) as Lead[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetchLeads()
    })
  }, [supabase, router, fetchLeads])

  const filtered = tab === 'todos' ? leads : leads.filter((l) => l.status === tab)

  const todayStr = today()
  const novosHoje = leads.filter((l) => l.created_at.startsWith(todayStr)).length
  const emAtendimento = leads.filter((l) => l.status === 'em_atendimento').length
  const qualificadosMes = leads.filter((l) => {
    const mes = new Date().toISOString().slice(0, 7)
    return l.status === 'qualificado' && l.last_message_at?.startsWith(mes)
  }).length

  if (loading) {
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
    <div className="min-h-screen pb-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/dashboard" className="text-lg" style={{ color: 'var(--mid)' }}>←</Link>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--teal), var(--purple-dark))' }}
          >
            💬
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--dark)' }}>
              Decora Festa <span style={{ color: 'var(--teal)' }}>· Atendimento</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--mid)' }}>Leads do WhatsApp</p>
          </div>
        </div>

        {/* KPI mini */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Novos hoje', value: novosHoje, color: 'var(--teal)' },
            { label: 'Em atendimento', value: emAtendimento, color: 'var(--orange-brand)' },
            { label: 'Qualificados/mês', value: qualificadosMes, color: 'var(--green-dark)' },
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
            const count = t.key === 'todos' ? leads.length : leads.filter((l) => l.status === t.key).length
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-3 py-1 rounded-full border text-xs font-extrabold transition-all"
                style={{
                  borderColor: active ? 'var(--teal)' : 'var(--border)',
                  background: active ? 'var(--teal)' : 'transparent',
                  color: active ? '#fff' : 'var(--mid)',
                }}
              >
                {t.label} {count > 0 && <span>({count})</span>}
              </button>
            )
          })}
        </div>

        {/* Lead list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🎈</p>
            <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Nenhum lead aqui ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => router.push(`/dashboard/atendimento/${lead.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
