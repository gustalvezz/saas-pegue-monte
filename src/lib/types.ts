export type TransactionType = 'receita' | 'despesa'

export type Category =
  | 'Locação'
  | 'Devolução'
  | 'Compra de Decoração'
  | 'Fatura Cartão'
  | 'Outros'

export interface Transaction {
  id: string
  date: string
  description: string
  type: TransactionType
  category: Category
  value: number
  created_at: string
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>

export interface KPIs {
  totalReceitas: number
  totalDespesas: number
  resultado: number
  ticketMedio: number
  totalLocacoes: number
}

export interface MonthlyData {
  month: string
  receitas: number
  despesas: number
  resultado: number
}
