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

// --- Atendimento / Chatbot types ---

export type LeadStatus = 'novo' | 'em_atendimento' | 'qualificado' | 'fechado' | 'perdido'
export type EventType = 'aniversário' | 'casamento' | 'chá_bebê' | 'debutante' | 'outros'
export type BudgetRange = 'até R$500' | 'R$500-R$1000' | 'R$1000-R$2000' | 'R$2000+'

export interface Lead {
  id: string
  phone: string
  name: string | null
  status: LeadStatus
  event_type: EventType | null
  event_date: string | null
  guest_count: number | null
  venue: string | null
  budget_range: BudgetRange | null
  theme_notes: string | null
  bot_active: boolean
  created_at: string
  last_message_at: string | null
}

export interface Conversation {
  id: string
  lead_id: string
  direction: 'inbound' | 'outbound'
  message_text: string | null
  media_url: string | null
  wa_message_id: string | null
  created_at: string
}

export type CatalogCategory = 'aniversário' | 'casamento' | 'chá_bebê' | 'debutante' | 'outros'

export interface CatalogItem {
  id: string
  name: string
  description: string | null
  category: CatalogCategory
  tags: string[]
  image_url: string
  active: boolean
  created_at: string
}
