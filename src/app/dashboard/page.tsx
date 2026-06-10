'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Transaction, TransactionInsert } from '@/lib/types'
import { computeKPIs, computeMonthlyData, exportToCSV, MONTH_NAMES } from '@/lib/utils'
import KPICards from '@/components/KPICards'
import MonthlyChart from '@/components/MonthlyChart'
import SideStats from '@/components/SideStats'
import TransactionForm from '@/components/TransactionForm'
import TransactionTable from '@/components/TransactionTable'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState<string>('Todos')
  const [filterType, setFilterType] = useState<string>('Todos')
  const [formOpen, setFormOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [userEmail, setUserEmail] = useState('')

  // Available months derived from data
  const availableMonths = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach((t) => {
      const mo = parseInt(t.date.split('-')[1])
      set.add(MONTH_NAMES[mo])
    })
    return Array.from(set)
  }, [transactions])

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    if (!error && data) setTransactions(data as Transaction[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email ?? '')
      fetchTransactions()
    })
  }, [supabase, router, fetchTransactions])

  // Filtered list for table
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const mo = parseInt(t.date.split('-')[1])
      const monthMatch = filterMonth === 'Todos' || MONTH_NAMES[mo] === filterMonth
      const typeMatch = filterType === 'Todos' || t.type === filterType
      return monthMatch && typeMatch
    })
  }, [transactions, filterMonth, filterType])

  const kpis = useMemo(() => computeKPIs(transactions), [transactions])
  const monthlyData = useMemo(() => computeMonthlyData(transactions), [transactions])

  async function handleSave(data: TransactionInsert) {
    if (editTx) {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', editTx.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('transactions').insert(data)
      if (error) throw error
    }
    await fetchTransactions()
    setEditTx(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transação?')) return
    await supabase.from('transactions').delete().eq('id', id)
    await fetchTransactions()
  }

  function openEdit(tx: Transaction) {
    setEditTx(tx)
    setFormOpen(true)
  }

  function openAdd() {
    setEditTx(null)
    setFormOpen(true)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🎈</div>
          <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--teal), var(--purple-dark))' }}
          >
            🎈
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--dark)' }}>
              Decora Festa <span style={{ color: 'var(--teal)' }}>· Financeiro</span>
            </h1>
            <p className="text-xs truncate" style={{ color: 'var(--mid)' }}>{userEmail}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <Link
              href="/dashboard/inventario"
              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold"
              style={{ borderColor: 'var(--orange-brand)', color: 'var(--orange-brand)', background: 'var(--orange-l)' }}
            >
              📦 Inventário
            </Link>
            <Link
              href="/dashboard/eventos"
              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold"
              style={{ borderColor: 'var(--purple-dark)', color: 'var(--purple-dark)', background: 'var(--purple-l)' }}
            >
              🎉 Eventos
            </Link>
            <Link
              href="/dashboard/atendimento"
              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold"
              style={{ borderColor: 'var(--teal)', color: 'var(--teal)', background: 'var(--teal-l)' }}
            >
              💬 Leads
            </Link>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold"
              style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* KPIs */}
        <KPICards kpis={kpis} />

        {/* CHART + SIDE STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3 mb-4">
          <MonthlyChart data={monthlyData} />
          <SideStats transactions={transactions} />
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Month filters */}
          <div className="flex gap-1.5 flex-wrap">
            {['Todos', ...availableMonths].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMonth(m)}
                className="px-3 py-1 rounded-full border text-xs font-extrabold transition-all"
                style={{
                  borderColor: filterMonth === m ? (m === 'Todos' ? 'var(--dark)' : 'var(--teal)') : 'var(--border)',
                  background: filterMonth === m ? (m === 'Todos' ? 'var(--dark)' : 'var(--teal)') : 'transparent',
                  color: filterMonth === m ? '#fff' : 'var(--mid)',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="w-px h-5 mx-0.5 flex-shrink-0" style={{ background: 'var(--border)' }} />

          {/* Type filters */}
          <div className="flex gap-1.5">
            {[
              { key: 'Todos', label: 'Todos' },
              { key: 'receita', label: '▲ Receitas' },
              { key: 'despesa', label: '▼ Despesas' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className="px-3 py-1 rounded-full border text-xs font-extrabold transition-all"
                style={{
                  borderColor:
                    filterType === f.key
                      ? f.key === 'receita'
                        ? 'var(--green-dark)'
                        : f.key === 'despesa'
                        ? 'var(--coral)'
                        : 'var(--dark)'
                      : 'var(--border)',
                  background:
                    filterType === f.key
                      ? f.key === 'receita'
                        ? 'var(--green-dark)'
                        : f.key === 'despesa'
                        ? 'var(--coral)'
                        : 'var(--dark)'
                      : 'transparent',
                  color: filterType === f.key ? '#fff' : 'var(--mid)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => exportToCSV(filtered)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold"
              style={{ borderColor: 'var(--border)', color: 'var(--mid)', background: '#fff' }}
            >
              ⬇ CSV
            </button>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 rounded-lg text-white text-xs font-extrabold"
              style={{ background: 'var(--dark)' }}
            >
              + Nova
            </button>
          </div>
        </div>

        {/* TABLE */}
        <TransactionTable
          transactions={filtered}
          onEdit={openEdit}
          onDelete={handleDelete}
        />

      </div>

      {/* FORM MODAL */}
      <TransactionForm
        open={formOpen}
        initial={editTx}
        onClose={() => { setFormOpen(false); setEditTx(null) }}
        onSave={handleSave}
      />

      {/* Field styles scoped here via global style tag */}
      <style jsx global>{`
        .field-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--light);
          margin-bottom: 4px;
        }
        .field-input {
          width: 100%;
          padding: 8px 10px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          color: var(--dark);
          background: #fff;
          outline: none;
        }
        .field-input:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(78,205,196,0.15);
        }
        .bg-coral-light { background-color: var(--coral-l); }
        .text-coral { color: var(--coral); }
      `}</style>
    </div>
  )
}
