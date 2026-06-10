'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { InventoryItem, ItemCategory, ItemMaterial } from '@/lib/types'
import InventoryItemCard from '@/components/InventoryItemCard'
import InventoryItemForm from '@/components/InventoryItemForm'

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  aniversário: 'Aniversário', casamento: 'Casamento', chá_bebê: 'Chá de bebê',
  debutante: 'Debutante', outros: 'Outros',
}
const MATERIAL_LABELS: Record<ItemMaterial, string> = {
  ceramica: 'Cerâmica', plastico: 'Plástico', mdf: 'MDF', acrilico: 'Acrílico',
  led: 'LED', tecido: 'Tecido', lona: 'Lona', outros: 'Outros',
}

export default function InventarioPage() {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<ItemCategory | 'todos'>('todos')
  const [filterMat, setFilterMat] = useState<ItemMaterial | 'todos'>('todos')
  const [formOpen, setFormOpen] = useState(false)

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true })
    setItems((data ?? []) as InventoryItem[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetchItems()
    })
  }, [supabase, router, fetchItems])

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.tags.some((t) => t.includes(search.toLowerCase()))
    const matchCat = filterCat === 'todos' || i.category === filterCat
    const matchMat = filterMat === 'todos' || i.material === filterMat
    return matchSearch && matchCat && matchMat
  })

  const totalItems = items.reduce((s, i) => s + i.quantity_total, 0)
  const activeItems = items.filter((i) => i.active).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">📦</div>
          <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Carregando inventário…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-lg" style={{ color: 'var(--mid)' }}>←</Link>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--orange-brand), var(--coral))' }}
          >
            📦
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--dark)' }}>
              Decora Festa <span style={{ color: 'var(--orange-brand)' }}>· Inventário</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--mid)' }}>
              {activeItems} itens · {totalItems} unidades no total
            </p>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-extrabold"
            style={{ background: 'var(--orange-brand)' }}
          >
            📷 Novo
          </button>
        </div>

        {/* Search */}
        <input
          className="field-input mb-3"
          placeholder="Buscar por nome, tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {(['todos', ...Object.keys(CATEGORY_LABELS)] as (ItemCategory | 'todos')[]).map((c) => {
            const count = c === 'todos' ? items.length : items.filter((i) => i.category === c).length
            const active = filterCat === c
            return (
              <button key={c} onClick={() => setFilterCat(c)}
                className="px-3 py-1 rounded-full border text-xs font-extrabold transition-all"
                style={{
                  borderColor: active ? 'var(--orange-brand)' : 'var(--border)',
                  background: active ? 'var(--orange-brand)' : 'transparent',
                  color: active ? '#fff' : 'var(--mid)',
                }}>
                {c === 'todos' ? 'Todos' : CATEGORY_LABELS[c]} ({count})
              </button>
            )
          })}
        </div>

        {/* Material filter */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {(['todos', ...Object.keys(MATERIAL_LABELS)] as (ItemMaterial | 'todos')[]).map((m) => {
            const count = m === 'todos' ? items.length : items.filter((i) => i.material === m).length
            if (count === 0 && m !== 'todos') return null
            const active = filterMat === m
            return (
              <button key={m} onClick={() => setFilterMat(m)}
                className="px-2.5 py-0.5 rounded-full border text-xs font-bold transition-all"
                style={{
                  borderColor: active ? 'var(--mid)' : 'var(--border)',
                  background: active ? 'var(--mid)' : 'transparent',
                  color: active ? '#fff' : 'var(--mid)',
                }}>
                {m === 'todos' ? 'Todos materiais' : MATERIAL_LABELS[m]}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📦</p>
            <p className="font-bold text-sm" style={{ color: 'var(--mid)' }}>
              {items.length === 0 ? 'Inventário vazio' : 'Nenhum item encontrado'}
            </p>
            {items.length === 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--light)' }}>
                Clique em "📷 Novo" para cadastrar o primeiro item
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onClick={() => router.push(`/dashboard/inventario/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <InventoryItemForm
          onSaved={fetchItems}
          onClose={() => setFormOpen(false)}
        />
      )}

      <style jsx global>{`
        .field-label {
          display: block; font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.5px;
          color: var(--light); margin-bottom: 4px;
        }
        .field-input {
          width: 100%; padding: 8px 10px;
          border: 1.5px solid var(--border); border-radius: 8px;
          font-size: 13px; font-family: 'Nunito', sans-serif;
          font-weight: 600; color: var(--dark); background: #fff; outline: none;
        }
        .field-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(78,205,196,0.15); }
      `}</style>
    </div>
  )
}
