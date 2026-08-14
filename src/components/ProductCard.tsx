import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import { InventoryItem } from '@/lib/types'
import { formatBRL } from '@/lib/utils'

interface Props {
  item: InventoryItem
}

export default function ProductCard({ item }: Props) {
  return (
    <Link
      href={`/produto/${item.slug}`}
      className="block rounded-xl overflow-hidden border transition-all hover:shadow-md"
      style={{ borderColor: 'var(--border)', background: '#fff' }}
    >
      <div className="relative" style={{ aspectRatio: '1 / 1' }}>
        <SafeImage src={item.image_url} alt={item.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
        {item.is_kit && (
          <span
            className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-xs font-extrabold"
            style={{ background: 'var(--purple-dark)', color: '#fff' }}
          >
            Kit
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="font-extrabold text-sm leading-tight truncate" style={{ color: 'var(--dark)' }}>
          {item.name}
        </p>
        {item.rental_price_unit != null && (
          <p className="text-sm font-black mt-1" style={{ color: 'var(--green-dark)' }}>
            {formatBRL(item.rental_price_unit)}
          </p>
        )}
      </div>
    </Link>
  )
}
