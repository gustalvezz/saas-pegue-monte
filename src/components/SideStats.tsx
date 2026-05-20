'use client'

import { Transaction } from '@/lib/types'
import { formatBRL } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
}

export default function SideStats({ transactions }: Props) {
  // Top 5 clients by locação revenue
  const clientMap: Record<string, number> = {}
  transactions
    .filter((t) => t.type === 'receita' && t.category === 'Locação')
    .forEach((t) => {
      clientMap[t.description] = (clientMap[t.description] ?? 0) + t.value
    })
  const top5 = Object.entries(clientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Category breakdown for despesas
  const catMap: Record<string, number> = {}
  transactions
    .filter((t) => t.type === 'despesa')
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] ?? 0) + t.value
    })
  const catTotal = Object.values(catMap).reduce((s, v) => s + v, 0)
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-xs font-extrabold uppercase tracking-wide mb-3" style={{ color: 'var(--mid)' }}>
          Top Clientes
        </h4>
        {top5.length === 0 && (
          <p className="text-xs text-brand-light">Sem dados</p>
        )}
        {top5.map(([name, val]) => (
          <div
            key={name}
            className="flex justify-between items-center py-1.5 border-b text-xs"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="truncate max-w-[120px] font-semibold" style={{ color: 'var(--mid)' }}>
              {name.split(' ').slice(0, 2).join(' ')}
            </span>
            <span className="font-extrabold" style={{ color: 'var(--dark)' }}>
              {formatBRL(val)}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-xs font-extrabold uppercase tracking-wide mb-3" style={{ color: 'var(--mid)' }}>
          Despesas por Categoria
        </h4>
        {cats.length === 0 && (
          <p className="text-xs text-brand-light">Sem dados</p>
        )}
        {cats.map(([cat, val]) => {
          const pct = catTotal > 0 ? Math.round((val / catTotal) * 100) : 0
          return (
            <div
              key={cat}
              className="flex justify-between items-center py-1.5 border-b text-xs"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="truncate max-w-[120px] font-semibold" style={{ color: 'var(--mid)' }}>
                {cat}
              </span>
              <span className="font-extrabold text-right" style={{ color: 'var(--dark)' }}>
                <span className="font-semibold mr-1" style={{ color: 'var(--light)' }}>{pct}%</span>
                {formatBRL(val)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
