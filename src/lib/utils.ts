import { Category, KPIs, MonthlyData, Transaction } from './types'

export const CATEGORIES: Category[] = [
  'Locação',
  'Devolução',
  'Compra de Decoração',
  'Fatura Cartão',
  'Outros',
]

export const MONTH_NAMES: Record<number, string> = {
  1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
  5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
  9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro',
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

export function getMonthFromDate(dateStr: string): string {
  const mo = parseInt(dateStr.split('-')[1])
  return MONTH_NAMES[mo] ?? ''
}

export function computeKPIs(transactions: Transaction[]): KPIs {
  const receitas = transactions.filter((t) => t.type === 'receita')
  const despesas = transactions.filter((t) => t.type === 'despesa')
  const locacoes = transactions.filter((t) => t.category === 'Locação')

  const totalReceitas = receitas.reduce((s, t) => s + t.value, 0)
  const totalDespesas = despesas.reduce((s, t) => s + t.value, 0)
  const totalLocacoesVal = locacoes.reduce((s, t) => s + t.value, 0)

  return {
    totalReceitas,
    totalDespesas,
    resultado: totalReceitas - totalDespesas,
    ticketMedio: locacoes.length > 0 ? totalLocacoesVal / locacoes.length : 0,
    totalLocacoes: locacoes.length,
  }
}

export function computeMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const map: Record<string, { receitas: number; despesas: number; order: number }> = {}

  transactions.forEach((t) => {
    const [y, m] = t.date.split('-')
    const key = `${y}-${m}`
    const label = `${MONTH_NAMES[parseInt(m)]} ${y}`
    if (!map[label]) map[label] = { receitas: 0, despesas: 0, order: parseInt(y) * 100 + parseInt(m) }
    if (t.type === 'receita') map[label].receitas += t.value
    else map[label].despesas += t.value
  })

  return Object.entries(map)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([month, data]) => ({
      month: month.split(' ')[0], // short month name
      receitas: data.receitas,
      despesas: data.despesas,
      resultado: data.receitas - data.despesas,
    }))
}

export function exportToCSV(transactions: Transaction[], filename = 'decora_festa_financeiro.csv') {
  const header = 'Data,Descrição,Categoria,Tipo,Valor'
  const lines = transactions.map((t) => {
    const signed = t.type === 'receita' ? t.value : -t.value
    return `${t.date},"${t.description}",${t.category},${t.type},${signed.toFixed(2)}`
  })
  const csv = [header, ...lines].join('\n')
  const a = document.createElement('a')
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
  a.download = filename
  a.click()
}

export function categoryPillStyle(category: Category): string {
  switch (category) {
    case 'Locação': return 'bg-teal-light text-teal-dark'
    case 'Devolução': return 'bg-orange-light text-orange-brand'
    case 'Fatura Cartão': return 'bg-purple-light text-purple-dark'
    case 'Outros': return 'bg-gray-100 text-gray-500'
    default: return 'bg-coral-light text-coral'
  }
}
