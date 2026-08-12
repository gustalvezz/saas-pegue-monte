import { createClient } from '@/lib/supabase-client'
import { InventoryItem } from '@/lib/types'

/** Finds active items matching any of the given tags (e.g. event type + theme keywords). */
export async function findRelevantItems(tags: string[]): Promise<InventoryItem[]> {
  const supabase = createClient()

  let query = supabase
    .from('inventory_items')
    .select('*')
    .eq('active', true)
    .limit(3)

  if (tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data } = await query.order('created_at', { ascending: false })
  return (data ?? []) as InventoryItem[]
}
