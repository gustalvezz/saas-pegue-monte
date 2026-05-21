import { createClient } from '@/lib/supabase-client'
import { CatalogItem, CatalogCategory } from '@/lib/types'

export async function findRelevantItems(
  category: CatalogCategory | null,
  tags: string[]
): Promise<CatalogItem[]> {
  const supabase = createClient()

  let query = supabase
    .from('catalog_items')
    .select('*')
    .eq('active', true)
    .limit(3)

  if (category) {
    query = query.eq('category', category)
  }

  if (tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data } = await query.order('created_at', { ascending: false })
  return (data ?? []) as CatalogItem[]
}
