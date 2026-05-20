'use client'

import { useState, useEffect } from 'react'
import { Category, Transaction, TransactionInsert, TransactionType } from '@/lib/types'
import { CATEGORIES } from '@/lib/utils'

interface Props {
  open: boolean
  initial?: Transaction | null
  onClose: () => void
  onSave: (data: TransactionInsert) => Promise<void>
}

const empty: TransactionInsert = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  type: 'receita',
  category: 'Locação',
  value: 0,
}

export default function TransactionForm({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<TransactionInsert>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date,
        description: initial.description,
        type: initial.type,
        category: initial.category,
        value: initial.value,
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [initial, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim() || form.value <= 0) {
      setError('Preencha todos os campos corretamente.')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(34,34,59,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-base font-extrabold" style={{ color: 'var(--dark)' }}>
            {initial ? '✏️ Editar Transação' : '✨ Nova Transação'}
          </h4>
          <button
            onClick={onClose}
            className="text-xl font-bold leading-none"
            style={{ color: 'var(--light)' }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-coral-light text-coral text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Data</label>
              <input
                type="date"
                required
                className="field-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Tipo</label>
              <select
                className="field-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Categoria</label>
            <select
              className="field-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Descrição</label>
            <input
              type="text"
              required
              className="field-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Nome do cliente ou fornecedor"
            />
          </div>

          <div>
            <label className="field-label">Valor (R$)</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              className="field-input"
              value={form.value || ''}
              onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
              placeholder="0,00"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60"
              style={{ background: 'var(--teal)' }}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-bold text-sm border"
              style={{ borderColor: 'var(--border)', color: 'var(--mid)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
