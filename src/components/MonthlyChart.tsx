'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { MonthlyData } from '@/lib/types'
import { formatBRL } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Props {
  data: MonthlyData[]
}

export default function MonthlyChart({ data }: Props) {
  const labels = data.map((d) => d.month)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Receitas',
        data: data.map((d) => d.receitas),
        backgroundColor: '#4ECDC4',
        borderRadius: 5,
        borderSkipped: false as const,
      },
      {
        label: 'Despesas',
        data: data.map((d) => d.despesas),
        backgroundColor: '#FF6B6B',
        borderRadius: 5,
        borderSkipped: false as const,
      },
      {
        label: 'Resultado',
        data: data.map((d) => d.resultado),
        backgroundColor: '#95E1A3',
        borderRadius: 5,
        borderSkipped: false as const,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${formatBRL(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#66667A', font: { size: 11, weight: 'bold' as const } },
      },
      y: {
        grid: { color: '#F0EAF4' },
        border: { display: false },
        ticks: {
          callback: (v: string | number) =>
            'R$' + (Number(v) / 1000).toFixed(1) + 'k',
          color: '#AAAABC',
          font: { size: 10 },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <h3 className="text-sm font-extrabold text-brand-dark">Receitas × Despesas por Mês</h3>
      <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--light)' }}>
        Entradas comparadas aos custos de portfólio
      </p>
      <div className="flex gap-4 mb-3 flex-wrap">
        {[
          { color: '#4ECDC4', label: 'Receitas' },
          { color: '#FF6B6B', label: 'Despesas' },
          { color: '#95E1A3', label: 'Resultado' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--mid)' }}>
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <div style={{ height: 200 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
