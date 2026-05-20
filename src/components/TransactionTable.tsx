'use client'

import { Transaction } from '@/lib/types'
import { categoryPillStyle, formatBRL, formatDate } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

function pillClass(category: string): string {
  switch (category) {
    case 'Locação': return 'pill-locacao'
    case 'Devolução': return 'pill-devolucao'
    case 'Fatura Cartão': return 'pill-fatura'
    case 'Outros': return 'pill-outros'
    default: return 'pill-compra'
  }
}

export default function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  const receitas = transactions.filter((t) => t.type === 'receita').reduce((s, t) => s + t.value, 0)
  const despesas = transactions.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.value, 0)
  const resultado = receitas - despesas

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ background: 'var(--dark)' }}>
              <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-white whitespace-nowrap">Data</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-white">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-white">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-white">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-extrabold uppercase tracking-wide text-white whitespace-nowrap">Valor</th>
              <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--light)' }}>
                  Nenhuma transação encontrada.
                </td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b hover:bg-purple-50/30"
                style={{ borderColor: 'var(--border)' }}
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold" style={{ color: 'var(--mid)' }}>
                  {formatDate(tx.date)}
                </td>
                <td className="px-4 py-2.5 font-bold max-w-[200px] truncate" style={{ color: 'var(--dark)' }}>
                  {tx.description}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold ${pillClass(tx.category)}`}>
                    {tx.category}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="text-xs font-extrabold"
                    style={{ color: tx.type === 'receita' ? 'var(--green-dark)' : 'var(--coral)' }}
                  >
                    {tx.type === 'receita' ? '▲ Receita' : '▼ Despesa'}
                  </span>
                </td>
                <td
                  className="px-4 py-2.5 text-right font-extrabold whitespace-nowrap"
                  style={{ color: tx.type === 'receita' ? 'var(--green-dark)' : 'var(--coral)' }}
                >
                  {tx.type === 'receita' ? '+' : '-'}{formatBRL(tx.value)}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(tx)}
                    className="px-2.5 py-1 rounded-lg text-xs font-extrabold mr-1.5"
                    style={{ background: 'var(--purple-l)', color: 'var(--purple-dark)' }}
                  >
                    ✏ Editar
                  </button>
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-extrabold"
                    style={{ background: 'var(--coral-l)', color: 'var(--coral)' }}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
        {transactions.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--light)' }}>
            Nenhuma transação encontrada.
          </div>
        )}
        {transactions.map((tx) => (
          <div key={tx.id} className="px-4 py-3">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1 min-w-0 mr-2">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--dark)' }}>
                  {tx.description}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--mid)' }}>
                  {formatDate(tx.date)}
                </p>
              </div>
              <p
                className="font-extrabold text-sm whitespace-nowrap"
                style={{ color: tx.type === 'receita' ? 'var(--green-dark)' : 'var(--coral)' }}
              >
                {tx.type === 'receita' ? '+' : '-'}{formatBRL(tx.value)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1.5 flex-wrap">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-extrabold ${pillClass(tx.category)}`}>
                  {tx.category}
                </span>
                <span
                  className="text-xs font-extrabold"
                  style={{ color: tx.type === 'receita' ? 'var(--green-dark)' : 'var(--coral)' }}
                >
                  {tx.type === 'receita' ? '▲' : '▼'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onEdit(tx)}
                  className="px-2.5 py-1 rounded-lg text-xs font-extrabold"
                  style={{ background: 'var(--purple-l)', color: 'var(--purple-dark)' }}
                >
                  ✏
                </button>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-extrabold"
                  style={{ background: 'var(--coral-l)', color: 'var(--coral)' }}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t flex flex-wrap gap-2 justify-between items-center text-xs"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="font-bold" style={{ color: 'var(--mid)' }}>
          {transactions.length} transaç{transactions.length === 1 ? 'ão' : 'ões'} exibidas
        </span>
        <span className="flex flex-wrap gap-2 items-center">
          <span style={{ color: 'var(--green-dark)' }} className="font-extrabold">
            +{formatBRL(receitas)}
          </span>
          <span style={{ color: 'var(--mid)' }}>receitas</span>
          <span style={{ color: 'var(--light)' }}>|</span>
          <span style={{ color: 'var(--coral)' }} className="font-extrabold">
            -{formatBRL(despesas)}
          </span>
          <span style={{ color: 'var(--mid)' }}>despesas</span>
          <span style={{ color: 'var(--light)' }}>|</span>
          <span
            className="font-extrabold"
            style={{ color: resultado >= 0 ? 'var(--green-dark)' : 'var(--coral)' }}
          >
            {resultado >= 0 ? '+' : '-'}{formatBRL(Math.abs(resultado))}
          </span>
        </span>
      </div>
    </div>
  )
}
