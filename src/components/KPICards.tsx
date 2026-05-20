'use client'

import { KPIs } from '@/lib/types'
import { formatBRL } from '@/lib/utils'

interface Props {
  kpis: KPIs
}

export default function KPICards({ kpis }: Props) {
  const cards = [
    {
      label: 'Total Receitas',
      value: formatBRL(kpis.totalReceitas),
      sub: `${kpis.totalLocacoes} locações realizadas`,
      icon: '📈',
      borderColor: 'var(--teal)',
      valueColor: 'var(--teal-d)',
    },
    {
      label: 'Total Despesas',
      value: formatBRL(kpis.totalDespesas),
      sub: 'Investimento em portfólio',
      icon: '💸',
      borderColor: 'var(--coral)',
      valueColor: 'var(--coral)',
    },
    {
      label: 'Resultado Líquido',
      value: formatBRL(Math.abs(kpis.resultado)),
      sub: kpis.resultado >= 0 ? 'Lucro acumulado' : 'Prejuízo acumulado',
      icon: kpis.resultado >= 0 ? '✅' : '⚠️',
      borderColor: kpis.resultado >= 0 ? 'var(--green-dark)' : 'var(--coral)',
      valueColor: kpis.resultado >= 0 ? 'var(--green-dark)' : 'var(--coral)',
    },
    {
      label: 'Ticket Médio',
      value: formatBRL(kpis.ticketMedio),
      sub: 'por locação',
      icon: '🎉',
      borderColor: 'var(--purple-dark)',
      valueColor: 'var(--purple-dark)',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mb-5 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden border-t-4"
          style={{ borderTopColor: c.borderColor }}
        >
          <p
            className="text-xs font-extrabold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--mid)' }}
          >
            {c.label}
          </p>
          <p className="text-lg font-black leading-tight" style={{ color: c.valueColor }}>
            {c.value}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--light)' }}>
            {c.sub}
          </p>
          <span
            className="absolute right-3 top-3 text-xl"
            style={{ opacity: 0.35 }}
          >
            {c.icon}
          </span>
        </div>
      ))}
    </div>
  )
}
