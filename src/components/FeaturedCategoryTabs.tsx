'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { InventoryItem, ProductCategory } from '@/lib/types'

interface Props {
  categories: ProductCategory[]
  itemsByCategory: Record<string, InventoryItem[]>
}

export default function FeaturedCategoryTabs({ categories, itemsByCategory }: Props) {
  const withItems = categories.filter((c) => (itemsByCategory[c.id]?.length ?? 0) > 0)
  const [activeId, setActiveId] = useState(withItems[0]?.id ?? '')
  const trackRef = useRef<HTMLDivElement>(null)

  function scrollTabs(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 160, behavior: 'smooth' })
  }

  if (withItems.length === 0) return null

  return (
    <section id="categorias" className="scroll-mt-20">
      <h2 className="text-lg font-black mb-3" style={{ color: 'var(--dark)' }}>Destaques</h2>

      {/* Abas de categoria */}
      <div className="relative mb-4">
        <div
          ref={trackRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pr-10"
        >
          {withItems.map((c) => {
            const active = activeId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-extrabold transition-all"
                style={{
                  borderColor: active ? 'var(--teal)' : 'var(--border)',
                  background: active ? 'var(--teal)' : '#fff',
                  color: active ? '#fff' : 'var(--mid)',
                }}
              >
                {c.name}
              </button>
            )
          })}
        </div>

        {/* Botão de rolagem — some no mobile, onde o dedo já rola direto */}
        <button
          type="button"
          onClick={() => scrollTabs(1)}
          aria-label="Ver mais categorias"
          className="hidden sm:flex absolute right-0 top-0 bottom-0 w-9 items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'linear-gradient(to right, transparent, var(--bg) 40%)' }}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shadow-sm"
            style={{ background: '#fff', color: 'var(--teal-d)', border: '1.5px solid var(--border)' }}
          >
            →
          </span>
        </button>
      </div>

      {/* Grades por categoria — todas ficam no DOM (bom para SEO/indexação),
          só a ativa fica visível */}
      {withItems.map((c) => (
        <div key={c.id} className={activeId === c.id ? 'block' : 'hidden'}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
            {itemsByCategory[c.id].map((item) => <ProductCard key={item.id} item={item} />)}
          </div>
          <Link href={`/categoria/${c.slug}`} className="text-xs font-extrabold" style={{ color: 'var(--teal-d)' }}>
            Ver tudo em {c.name} →
          </Link>
        </div>
      ))}
    </section>
  )
}
