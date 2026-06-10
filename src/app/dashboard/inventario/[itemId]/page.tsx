'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { InventoryItem, DecoraEvent } from '@/lib/types'
import { getConflictingEvents } from '@/lib/inventory'
import { formatBRL } from '@/lib/utils'
import InventoryItemForm from '@/components/InventoryItemForm'
import AvailabilityBadge from '@/components/AvailabilityBadge'

const MATERIAL_LABELS: Record<string, string> = {
  ceramica: 'Cerâmica', plastico: 'Plástico', mdf: 'MDF', acrilico: 'Acrílico',
  led: 'LED', tecido: 'Tecido', lona: 'Lona', outros: 'Outros',
}

function today() { return new Date().toISOString().split('T')[0] }
function in60() {
  const d = new Date(); d.setDate(d.getDate() + 60)
  return d.toISOString().split('T')[0]
}
function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.itemId as string
  const supabase = createClient()

  const [item, setItem] = useState<InventoryItem | null>(null)
  const [conflicts, setConflicts] = useState<DecoraEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const fetchItem = useCallback(async () => {
    const { data } = await supabase.from('inventory_items').select('*').eq('id', itemId).single()
    if (data) {
      setItem(data as InventoryItem)
      const evts = await getConflictingEvents(itemId, today(), in60())
      setConflicts(evts)
    }
    setLoading(false)
  }, [supabase, itemId])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      fetchItem()
    })
  }, [supabase, router, fetchItem])

  async function toggleActive() {
    if (!item) return
    await supabase.from('inventory_items').update({ active: !item.active }).eq('id', item.id)
    setItem({ ...item, active: !item.active })
  }

  async function handleDelete() {
    if (!confirm('Excluir este item permanentemente?')) return
    await supabase.from('inventory_items').delete().eq('id', itemId)
    router.push('/dashboard/inventario')
  }

  if (loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-4xl animate-bounce">📦</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-3 sm:px-5 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard/inventario" className="text-lg" style={{ color: 'var(--mid)' }}>←</Link>
          <h1 className="flex-1 font-black text-base truncate" style={{ color: 'var(--dark)' }}>{item.name}</h1>
          <button
            onClick={() => setEditOpen(true)}
            className="px-3 py-1.5 rounded-lg border text-xs font-bold"
            style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
          >
            Editar
          </button>
        </div>

        {/* Photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full rounded-2xl object-cover mb-4"
          style={{ maxHeight: 280, opacity: item.active ? 1 : 0.6 }}
        />

        {/* Attributes card */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <AvailabilityBadge available={item.quantity_total} total={item.quantity_total} size="md" />
            <span
              className="text-xs font-extrabold px-2 py-0.5 rounded-full"
              style={{
                color: item.active ? 'var(--green-dark)' : 'var(--mid)',
                background: item.active ? 'var(--green-l)' : 'var(--border)',
              }}
            >
              {item.active ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Categoria', value: item.category },
              { label: 'Material', value: item.material ? MATERIAL_LABELS[item.material] : null },
              { label: 'Cor', value: item.color },
              { label: 'Tamanho', value: item.size_description },
              { label: 'Quantidade em estoque', value: String(item.quantity_total) },
              { label: 'Preço de locação', value: item.rental_price_unit ? formatBRL(item.rental_price_unit) + '/un.' : null },
              { label: 'Preço de reposição', value: item.replacement_price ? formatBRL(item.replacement_price) : null },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--light)', letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ color: value ? 'var(--dark)' : 'var(--border)' }}>{value ?? '—'}</p>
              </div>
            ))}
          </div>

          {item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg)', color: 'var(--mid)' }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming conflicts */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#fff', border: '1.5px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3" style={{ color: 'var(--dark)' }}>
            Próximas alocações (60 dias)
          </h3>
          {conflicts.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--mid)' }}>Nenhum evento nos próximos 60 dias</p>
          ) : (
            <div className="space-y-2">
              {conflicts.map((e) => (
                <button
                  key={e.id}
                  onClick={() => router.push(`/dashboard/eventos/${e.id}`)}
                  className="w-full text-left px-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                >
                  <p className="font-bold" style={{ color: 'var(--dark)' }}>{e.client_name}</p>
                  <p className="text-xs" style={{ color: 'var(--mid)' }}>
                    🎉 {fmt(e.event_date)} · Ret. {fmt(e.pickup_date)} → Dev. {fmt(e.return_date)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={toggleActive}
            className="flex-1 py-2.5 rounded-xl border text-sm font-extrabold"
            style={{
              borderColor: item.active ? 'var(--mid)' : 'var(--teal)',
              color: item.active ? 'var(--mid)' : 'var(--teal)',
            }}
          >
            {item.active ? 'Desativar' : 'Reativar'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl border text-sm font-extrabold"
            style={{ borderColor: 'var(--coral)', color: 'var(--coral)' }}
          >
            Excluir
          </button>
        </div>
      </div>

      {editOpen && (
        <InventoryItemForm
          initial={item}
          onSaved={fetchItem}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  )
}
