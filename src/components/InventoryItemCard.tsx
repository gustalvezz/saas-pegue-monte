'use client'

import { InventoryItem } from '@/lib/types'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import { formatBRL } from '@/lib/utils'

const MATERIAL_LABELS: Record<string, string> = {
  ceramica: 'Cerâmica', plastico: 'Plástico', mdf: 'MDF',
  acrilico: 'Acrílico', led: 'LED', tecido: 'Tecido', lona: 'Lona', outros: 'Outros',
}

interface Props {
  item: InventoryItem
  availableQty?: number
  onClick?: () => void
  compact?: boolean
}

export default function InventoryItemCard({ item, availableQty, onClick, compact = false }: Props) {
  const avail = availableQty ?? item.quantity_total

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden border transition-all hover:shadow-md"
      style={{
        borderColor: 'var(--border)',
        background: '#fff',
        opacity: item.active ? 1 : 0.5,
      }}
    >
      {/* Photo */}
      <div className="relative" style={{ height: compact ? 100 : 140 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1.5 right-1.5">
          <AvailabilityBadge available={avail} total={item.quantity_total} />
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="font-extrabold text-xs leading-tight truncate" style={{ color: 'var(--dark)' }}>
          {item.name}
        </p>

        <div className="flex flex-wrap gap-1 mt-1">
          {item.color && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--teal-l)', color: 'var(--teal-d)' }}>
              {item.color}
            </span>
          )}
          {item.material && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--mid)' }}>
              {MATERIAL_LABELS[item.material] ?? item.material}
            </span>
          )}
        </div>

        {!compact && item.rental_price_unit && (
          <p className="text-xs font-extrabold mt-1.5" style={{ color: 'var(--green-dark)' }}>
            {formatBRL(item.rental_price_unit)}<span className="font-normal" style={{ color: 'var(--mid)' }}>/un.</span>
          </p>
        )}
      </div>
    </button>
  )
}
