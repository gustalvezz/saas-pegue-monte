import { createClient } from '@/lib/supabase-client'
import { InventoryItem, InventoryItemWithAvail, DecoraEvent } from '@/lib/types'

interface ConflictRow {
  inventory_item_id: string
  quantity: number
}

interface KitComponentRow {
  kit_id: string
  component_item_id: string
  quantity: number
}

/** Expands direct item reservations into a per-item reserved map, unrolling
 * kit bookings into their component items (a kit occupies one row in
 * event_items, but consumes stock from each of its components). */
function buildReservedMap(conflicts: ConflictRow[], kitComponents: KitComponentRow[]): Record<string, number> {
  const componentsByKit: Record<string, KitComponentRow[]> = {}
  for (const kc of kitComponents) {
    ;(componentsByKit[kc.kit_id] ??= []).push(kc)
  }

  const reserved: Record<string, number> = {}
  for (const row of conflicts) {
    const kitParts = componentsByKit[row.inventory_item_id]
    if (kitParts) {
      for (const part of kitParts) {
        reserved[part.component_item_id] = (reserved[part.component_item_id] ?? 0) + part.quantity * row.quantity
      }
    } else {
      reserved[row.inventory_item_id] = (reserved[row.inventory_item_id] ?? 0) + row.quantity
    }
  }
  return reserved
}

/** Quantity available for an item in a date range (excluding a specific event when editing).
 * Works for both standalone items and kits (kit availability = worst component ratio). */
export async function checkItemAvailability(
  itemId: string,
  pickupDate: string,
  returnDate: string,
  excludeEventId?: string
): Promise<number> {
  const supabase = createClient()

  const { data: item } = await supabase
    .from('inventory_items')
    .select('quantity_total, is_kit')
    .eq('id', itemId)
    .single()

  if (!item) return 0

  const { data: kitComponents } = await supabase
    .from('kit_items')
    .select('kit_id, component_item_id, quantity')

  let query = supabase
    .from('event_items')
    .select('inventory_item_id, quantity, events!inner(status, pickup_date, return_date)')
    .neq('events.status', 'cancelado')
    .lte('events.pickup_date', returnDate)
    .gte('events.return_date', pickupDate)

  if (excludeEventId) {
    query = query.neq('events.id', excludeEventId)
  }

  const { data: conflicts } = await query
  const reserved = buildReservedMap((conflicts ?? []) as ConflictRow[], (kitComponents ?? []) as KitComponentRow[])

  if (!item.is_kit) {
    return Math.max(0, item.quantity_total - (reserved[itemId] ?? 0))
  }

  const parts = (kitComponents ?? []).filter((kc) => kc.kit_id === itemId) as KitComponentRow[]
  if (parts.length === 0) return item.quantity_total

  const { data: components } = await supabase
    .from('inventory_items')
    .select('id, quantity_total')
    .in('id', parts.map((p) => p.component_item_id))

  const componentQtyById: Record<string, number> = {}
  for (const c of components ?? []) componentQtyById[c.id] = c.quantity_total

  const kitsAvailableByComponent = parts.map((p) => {
    const available = Math.max(0, (componentQtyById[p.component_item_id] ?? 0) - (reserved[p.component_item_id] ?? 0))
    return Math.floor(available / p.quantity)
  })

  return Math.max(0, Math.min(item.quantity_total, ...kitsAvailableByComponent))
}

/** All active items with computed availability for a date range.
 * Kit availability is derived from the worst component ratio, capped by the
 * kit's own `quantity_total`. */
export async function getItemsWithAvailability(
  pickupDate: string,
  returnDate: string,
  excludeEventId?: string,
  categoryId?: string | null
): Promise<InventoryItemWithAvail[]> {
  const supabase = createClient()

  let itemQuery = supabase
    .from('inventory_items')
    .select('*')
    .eq('active', true)
    .order('name')

  if (categoryId) {
    itemQuery = itemQuery.eq('category_id', categoryId)
  }

  const { data: items } = await itemQuery
  if (!items?.length) return []

  const { data: kitComponents } = await supabase
    .from('kit_items')
    .select('kit_id, component_item_id, quantity')

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
  const reserved = buildReservedMap((conflicts ?? []) as ConflictRow[], (kitComponents ?? []) as KitComponentRow[])

  const quantityById: Record<string, number> = {}
  for (const item of items as InventoryItem[]) quantityById[item.id] = item.quantity_total

  const partsByKit: Record<string, KitComponentRow[]> = {}
  for (const kc of (kitComponents ?? []) as KitComponentRow[]) {
    ;(partsByKit[kc.kit_id] ??= []).push(kc)
  }

  return (items as InventoryItem[]).map((item) => {
    if (!item.is_kit) {
      return { ...item, quantity_available: Math.max(0, item.quantity_total - (reserved[item.id] ?? 0)) }
    }
    const parts = partsByKit[item.id] ?? []
    if (parts.length === 0) return { ...item, quantity_available: item.quantity_total }
    const ratios = parts.map((p) => {
      const available = Math.max(0, (quantityById[p.component_item_id] ?? 0) - (reserved[p.component_item_id] ?? 0))
      return Math.floor(available / p.quantity)
    })
    return { ...item, quantity_available: Math.max(0, Math.min(item.quantity_total, ...ratios)) }
  })
}

/** Events that conflict with a date range for a specific item — includes
 * events that booked a kit containing this item as a component. */
export async function getConflictingEvents(
  itemId: string,
  pickupDate: string,
  returnDate: string
): Promise<DecoraEvent[]> {
  const supabase = createClient()

  const { data: kitsContainingItem } = await supabase
    .from('kit_items')
    .select('kit_id')
    .eq('component_item_id', itemId)

  const relevantItemIds = [itemId, ...(kitsContainingItem ?? []).map((k) => k.kit_id)]

  const { data } = await supabase
    .from('event_items')
    .select('events!inner(*)')
    .in('inventory_item_id', relevantItemIds)
    .neq('events.status', 'cancelado')
    .lte('events.pickup_date', returnDate)
    .gte('events.return_date', pickupDate)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = (data ?? []).map((r) => (r as any).events) as DecoraEvent[]
  const seen = new Set<string>()
  return events.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)))
}
