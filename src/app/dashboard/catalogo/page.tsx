'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { CatalogItem, CatalogCategory } from '@/lib/types'
import CatalogUpload from '@/components/CatalogUpload'

const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  aniversário: 'Aniversário',
  casamento: 'Casamento',
  chá_bebê: 'Chá de bebê',
  debutante: 'Debutante',
  outros: 'Outros',
}

const CATEGORY_COLORS: Record<CatalogCategory, string> = {
  aniversário: 'var(--teal)',
  casamento: 'var(--coral)',
  chá_bebê: 'var(--purple-brand)',
  debutante: 'var(--orange-brand)',
  outros: 'var(--mid)',
}

export default function CatalogoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState<CatalogCategory | 'todos'>('todos')

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('catalog_items')
      .select('*')
      .order('created_at', { ascending: false })
    setItems((data ?? []) as CatalogItem[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetchItems()
    })
  }, [supabase, router, fetchItems])

  async function toggleActive(item: CatalogItem) {
    await supabase.from('catalog_items').update({ active: !item.active }).eq('id', item.id)
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, active: !i.active } : i))
  }

  async function deleteItem(id: string) {
    if (!confirm('Excluir esta foto do catálogo?')) return
    await supabase.from('catalog_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const filtered = filterCat === 'todos' ? items : items.filter((i) => i.category === filterCat)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🖼</div>
          <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-3 sm:px-5 pt-4 sm:pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/dashboard" className="text-lg" style={{ color: 'var(--mid)' }}>←</Link>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--coral), var(--orange-brand))' }}
          >
            🖼
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--dark)' }}>
              Decora Festa <span style={{ color: 'var(--coral)' }}>· Catálogo</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--mid)' }}>{items.length} fotos · {items.filter((i) => i.active).length} ativas</p>
          </div>
          <CatalogUpload onUploaded={fetchItems} />
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {([{ key: 'todos', label: 'Todos' }, ...Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ key: k, label: v }))] as { key: string; label: string }[]).map((f) => {
            const count = f.key === 'todos' ? items.length : items.filter((i) => i.category === f.key).length
            const active = filterCat === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilterCat(f.key as CatalogCategory | 'todos')}
                className="px-3 py-1 rounded-full border text-xs font-extrabold transition-all"
                style={{
                  borderColor: active ? 'var(--coral)' : 'var(--border)',
                  background: active ? 'var(--coral)' : 'transparent',
                  color: active ? '#fff' : 'var(--mid)',
                }}
              >
                {f.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-2">🖼</p>
            <p className="text-sm font-bold" style={{ color: 'var(--mid)' }}>Nenhuma foto aqui ainda</p>
            <p className="text-xs mt-1" style={{ color: 'var(--light)' }}>Clique em "+ Nova foto" para adicionar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: 'var(--border)', background: '#fff', opacity: item.active ? 1 : 0.5 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full object-cover"
                  style={{ height: 140 }}
                />
                <div className="p-2">
                  <p className="text-xs font-extrabold leading-tight truncate" style={{ color: 'var(--dark)' }}>
                    {item.name}
                  </p>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block"
                    style={{ color: CATEGORY_COLORS[item.category], background: CATEGORY_COLORS[item.category] + '20' }}
                  >
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  {item.tags.length > 0 && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--light)' }}>
                      {item.tags.join(', ')}
                    </p>
                  )}
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => toggleActive(item)}
                      className="flex-1 py-1 rounded-lg text-xs font-extrabold border transition-all"
                      style={{
                        borderColor: item.active ? 'var(--green-dark)' : 'var(--border)',
                        color: item.active ? 'var(--green-dark)' : 'var(--mid)',
                      }}
                    >
                      {item.active ? 'Ativa' : 'Inativa'}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="px-2 py-1 rounded-lg text-xs font-extrabold border"
                      style={{ borderColor: 'var(--coral)', color: 'var(--coral)' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
