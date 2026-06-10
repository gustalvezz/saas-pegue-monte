'use client'

import { useEffect, useState } from 'react'
import { InventoryItemWithAvail, EventItem } from '@/lib/types'
import { getItemsWithAvailability } from '@/lib/inventory'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import { formatBRL } from '@/lib/utils'

interface Selection {
  item: InventoryItemWithAvail
  quantity: number
  unit_price: number
}

interface Props {
  pickupDate: string
  returnDate: string
  excludeEventId?: string
  existingItems?: EventItem[]
  onConfirm: (selections: Selection[]) => void
  onClose: () => void
}

export default function ItemPicker({ pickupDate, returnDate, excludeEventId, existingItems = [], onConfirm, onClose }: Props) {
  const [items, setItems] = useState<InventoryItemWithAvail[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selections, setSelections] = useState<Record<string, { qty: number; price: number }>>(() => {
    const map: Record<string, { qty: number; price: number }> = {}
    existingItems.forEach((ei) => {
      map[ei.inventory_item_id] = { qty: ei.quantity, price: ei.unit_price }
    })
    return map
  })

  useEffect(() => {
    getItemsWithAvailability(pickupDate, returnDate, excludeEventId)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [pickupDate, returnDate, excludeEventId])

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.tags.some((t) => t.includes(search.toLowerCase()))
  )

  function setQty(itemId: string, qty: number, defaultPrice: number) {
    if (qty <= 0) {
      const next = { ...selections }
      delete next[itemId]
      setSelections(next)
    } else {
      setSelections((prev) => ({
        ...prev,
        [itemId]: { qty, price: prev[itemId]?.price ?? defaultPrice },
      }))
    }
  }

  function setPrice(itemId: string, price: number) {
    setSelections((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], price },
    }))
  }

  function handleConfirm() {
    const result: Selection[] = Object.entries(selections)
      .map(([id, { qty, price }]) => {
        const item = items.find((i) => i.id === id)!
        return { item, quantity: qty, unit_price: price }
      })
      .filter((s) => s.item)
    onConfirm(result)
  }

  const totalSelected = Object.keys(selections).length

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col"
        style={{ background: '#fff', maxHeight: '88dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1.5px solid var(--border)' }}>
          <div>
            <h2 className="font-black text-base" style={{ color: 'var(--dark)' }}>Selecionar itens</h2>
            <p className="text-xs" style={{ color: 'var(--mid)' }}>
              {pickupDate} → {returnDate}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--mid)' }} className="text-xl">✕</button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <input
            className="field-input"
            placeholder="Buscar por nome ou tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2">
          {loading ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--mid)' }}>Verificando disponibilidade…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--mid)' }}>Nenhum item encontrado</p>
          ) : filtered.map((item) => {
            const sel = selections[item.id]
            const maxQty = item.quantity_available + (sel?.qty ?? 0)
            const unavailable = maxQty === 0 && !sel

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-xl border"
                style={{
                  borderColor: sel ? 'var(--teal)' : 'var(--border)',
                  background: sel ? 'var(--teal-l)' : unavailable ? 'var(--bg)' : '#fff',
                  opacity: unavailable ? 0.5 : 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold truncate" style={{ color: 'var(--dark)' }}>{item.name}</p>
                  <AvailabilityBadge available={item.quantity_available} total={item.quantity_total} />
                  {sel && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="number"
                        min={0}
                        max={maxQty}
                        value={sel.qty}
                        onChange={(e) => setQty(item.id, parseInt(e.target.value) || 0, item.rental_price_unit ?? 0)}
                        className="w-14 field-input py-1 text-center"
                        style={{ fontSize: 13 }}
                      />
                      <span className="text-xs" style={{ color: 'var(--mid)' }}>un. × R$</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={sel.price}
                        onChange={(e) => setPrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-20 field-input py-1"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  )}
                </div>
                {!unavailable && (
                  <button
                    onClick={() => setQty(item.id, sel ? 0 : 1, item.rental_price_unit ?? 0)}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-lg flex-shrink-0"
                    style={{
                      background: sel ? 'var(--coral)' : 'var(--teal)',
                      color: '#fff',
                    }}
                  >
                    {sel ? '−' : '+'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3" style={{ borderTop: '1.5px solid var(--border)' }}>
          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl text-white font-extrabold text-sm"
            style={{ background: 'var(--teal)' }}
          >
            Confirmar {totalSelected > 0 ? `(${totalSelected} item${totalSelected > 1 ? 's' : ''})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
