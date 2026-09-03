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

export interface PushSubscriptionRecord {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth_key: string
  created_at: string
}

// --- Inventário / Loja Pública ---

export type ItemMaterial = 'ceramica' | 'plastico' | 'mdf' | 'acrilico' | 'led' | 'tecido' | 'lona' | 'outros'

/** Categoria por tipo de produto (navegação da loja) — ex: Balões, Mesas, Pegue e Monte */
export interface ProductCategory {
  id: string
  name: string
  slug: string
  created_at: string
}

/** Tag pré-cadastrada (ocasião/público-alvo) — ex: Infantil, Menina, 15 Anos */
export interface TagOption {
  id: string
  name: string
  slug: string
  created_at: string
}

/** Physical inventory item — pode ser um item avulso ou um kit (is_kit) */
export interface InventoryItem {
  id: string
  name: string
  description: string | null
  category_id: string | null
  slug: string
  is_kit: boolean
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

export interface InventoryItemWithCategory extends InventoryItem {
  category: ProductCategory | null
}

/** InventoryItem with computed availability for a given date range */
export interface InventoryItemWithAvail extends InventoryItem {
  quantity_available: number
}

/** Componente de um kit ("conteúdo do kit") */
export interface KitItem {
  id: string
  kit_id: string
  component_item_id: string
  quantity: number
  created_at: string
}

export interface KitItemWithDetail extends KitItem {
  component: InventoryItem
}

export type CatalogItem = InventoryItem

// --- Clientes / Contratos (Loja Pública) ---

export interface Customer {
  id: string
  name: string
  cpf: string
  rg: string | null
  phone: string
  email: string
  address: string
  reference_name: string | null
  reference_phone: string | null
  created_at: string
}

export interface HeroImage {
  id: string
  image_url: string
  display_order: number
  active: boolean
  created_at: string
}

export type SpaceType = 'interno' | 'externo' | 'misto'
export type ReturnShipping = 'locataria' | 'locadora' | 'retirada_locadora'

export interface Contract {
  id: string
  event_id: string
  pdf_url: string | null
  signature_image_url: string | null
  signer_ip: string | null
  signer_user_agent: string | null
  signed_at: string | null
  sign_token: string | null
  created_at: string
}

// --- Eventos / Contratos ---

export type EventStatus = 'cotacao' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado'

export interface DecoraEvent {
  id: string
  lead_id: string | null
  customer_id: string | null
  client_name: string
  client_phone: string | null
  event_type: EventType | null
  event_date: string
  pickup_date: string
  return_date: string
  pickup_time: string | null
  return_deadline_time: string | null
  venue: string | null
  theme_notes: string | null
  guest_count: number | null
  space_type: SpaceType | null
  delivery_fee: number
  return_shipping: ReturnShipping | null
  deposit_amount: number | null
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
