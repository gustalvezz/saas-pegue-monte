import { createClient } from '@/lib/supabase-client'
import { InventoryItem, InventoryItemWithAvail, DecoraEvent, ItemCategory } from '@/lib/types'

/** Quantity available for an item in a date range (excluding a specific event when editing) */
export async function checkItemAvailability(
  itemId: string,
  pickupDate: string,
  returnDate: string,
  excludeEventId?: string
): Promise<number> {
  const supabase = createClient()

  const { data: item } = await supabase
    .from('inventory_items')
    .select('quantity_total')
    .eq('id', itemId)
    .single()

  if (!item) return 0

  // Sum quantities reserved in overlapping events
  let query = supabase
    .from('event_items')
    .select('quantity, events!inner(status, pickup_date, return_date)')
    .eq('inventory_item_id', itemId)
    .neq('events.status', 'cancelado')
    .lte('events.pickup_date', returnDate)
    .gte('events.return_date', pickupDate)

  if (excludeEventId) {
    query = query.neq('events.id', excludeEventId)
  }

  const { data: conflicts } = await query

  const reserved = (conflicts ?? []).reduce((sum, row) => sum + (row.quantity as number), 0)
  return Math.max(0, item.quantity_total - reserved)
}

/** All active items with computed availability for a date range */
export async function getItemsWithAvailability(
  pickupDate: string,
  returnDate: string,
  excludeEventId?: string,
  category?: ItemCategory | null
): Promise<InventoryItemWithAvail[]> {
  const supabase = createClient()

  let itemQuery = supabase
    .from('inventory_items')
    .select('*')
    .eq('active', true)
    .order('name')

  if (category) {
    itemQuery = itemQuery.eq('category', category)
  }

  const { data: items } = await itemQuery
  if (!items?.length) return []

  // Fetch all conflicting reservations in one query
  let conflictsQuery = supabase
    .from('event_items')
    .select('inventory_item_id, quantity, events!inner(status, pickup_date, return_date)')
    .neq('events.status', 'cancelado')
    .lte('events.pickup_date', returnDate)
    .gte('events.return_date', pickupDate)

  if (excludeEventId) {
    conflictsQuery = conflictsQuery.neq('events.id', excludeEventId)
  }

  const { data: conflicts } = await conflictsQuery

  // Build reserved map
  const reserved: Record<string, number> = {}
  for (const row of conflicts ?? []) {
    const id = row.inventory_item_id as string
    reserved[id] = (reserved[id] ?? 0) + (row.quantity as number)
  }

  return (items as InventoryItem[]).map((item) => ({
    ...item,
    quantity_available: Math.max(0, item.quantity_total - (reserved[item.id] ?? 0)),
  }))
}

/** Events that conflict with a date range for a specific item */
export async function getConflictingEvents(
  itemId: string,
  pickupDate: string,
  returnDate: string
): Promise<DecoraEvent[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('event_items')
    .select('events!inner(*)')
    .eq('inventory_item_id', itemId)
    .neq('events.status', 'cancelado')
    .lte('events.pickup_date', returnDate)
    .gte('events.return_date', pickupDate)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []).map((r) => ((r as any).events))) as DecoraEvent[]
}
