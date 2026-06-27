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

// --- Inventário ---

export type ItemCategory = 'aniversário' | 'casamento' | 'chá_bebê' | 'debutante' | 'outros'
export type ItemMaterial = 'ceramica' | 'plastico' | 'mdf' | 'acrilico' | 'led' | 'tecido' | 'lona' | 'outros'

/** Physical inventory item (replaces catalog_items table) */
export interface InventoryItem {
  id: string
  name: string
  description: string | null
  category: ItemCategory
  color: string | null
  size_description: string | null
  material: ItemMaterial | null
  tags: string[]
  image_url: string
  quantity_total: number
  replacement_price: number | null
  rental_price_unit: number | null
  active: boolean
  created_at: string
}

/** InventoryItem with computed availability for a given date range */
export interface InventoryItemWithAvail extends InventoryItem {
  quantity_available: number
}

// Keep alias so old chatbot code compiles while we migrate
export type CatalogCategory = ItemCategory
export type CatalogItem = InventoryItem

// --- Eventos / Contratos ---

export type EventStatus = 'cotacao' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado'

export interface DecoraEvent {
  id: string
  lead_id: string | null
  client_name: string
  client_phone: string | null
  event_type: EventType | null
  event_date: string
  pickup_date: string
  return_date: string
  venue: string | null
  theme_notes: string | null
  guest_count: number | null
  status: EventStatus
  notes: string | null
  google_event_id: string | null
  created_at: string
}

export interface GoogleToken {
  id: string
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface EventItem {
  id: string
  event_id: string
  inventory_item_id: string
  quantity: number
  unit_price: number
  created_at: string
}

export interface EventItemWithDetail extends EventItem {
  inventory_item: InventoryItem
}
