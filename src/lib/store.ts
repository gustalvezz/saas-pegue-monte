import { createPublicSupabase } from '@/lib/supabase-public'
import { HeroImage, InventoryItem, InventoryItemWithCategory, KitItemWithDetail, ProductCategory } from '@/lib/types'

/** Consultas públicas do catálogo (loja) — usam o client público (sem
 * cookies), que respeita as policies de leitura pública (anon) do Supabase
 * e permite pré-renderização estática das páginas. Toda função tolera
 * falha de rede/banco (ex: build sem credenciais reais, instabilidade
 * momentânea do Supabase) devolvendo um resultado vazio em vez de
 * derrubar a página ou o build inteiro. */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function getCategories(): Promise<ProductCategory[]> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase.from('categories').select('*').order('name')
    return (data ?? []) as ProductCategory[]
  }, [])
}

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle()
    return data as ProductCategory | null
  }, null)
}

export async function getItemsByCategory(categoryId: string): Promise<InventoryItem[]> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('active', true)
      .eq('category_id', categoryId)
      .order('name')
    return (data ?? []) as InventoryItem[]
  }, [])
}

export async function getItemBySlug(slug: string): Promise<InventoryItemWithCategory | null> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase
      .from('inventory_items')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
    return data as InventoryItemWithCategory | null
  }, null)
}

export async function getKitComponents(kitId: string): Promise<KitItemWithDetail[]> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase
      .from('kit_items')
      .select('*, component:inventory_items!kit_items_component_item_id_fkey(*)')
      .eq('kit_id', kitId)
    return (data ?? []) as KitItemWithDetail[]
  }, [])
}

export async function getRelatedItems(categoryId: string | null, excludeId: string, limit = 4): Promise<InventoryItem[]> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    let query = supabase.from('inventory_items').select('*').eq('active', true).neq('id', excludeId).limit(limit)
    if (categoryId) query = query.eq('category_id', categoryId)
    const { data } = await query
    return (data ?? []) as InventoryItem[]
  }, [])
}

/** Itens ativos agrupados por categoria, com um limite por categoria — usado
 * pelas abas de destaques na home. Uma única consulta (sem N+1). */
export async function getItemsGroupedByCategory(perCategory = 10): Promise<Record<string, InventoryItem[]>> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('active', true)
      .not('category_id', 'is', null)
      .order('created_at', { ascending: false })

    const grouped: Record<string, InventoryItem[]> = {}
    for (const item of (data ?? []) as InventoryItem[]) {
      const catId = item.category_id!
      if (!grouped[catId]) grouped[catId] = []
      if (grouped[catId].length < perCategory) grouped[catId].push(item)
    }
    return grouped
  }, {})
}

/** Fotos do carrossel do hero, escolhidas pela Flávia no dashboard. Se ela
 * ainda não cadastrou nenhuma, usa as fotos dos kits como padrão inicial —
 * assim o hero já nasce populado sem exigir upload manual. */
export async function getHeroImages(limit = 4): Promise<string[]> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase
      .from('hero_images')
      .select('*')
      .eq('active', true)
      .order('display_order')
      .limit(limit)

    const configured = (data ?? []) as HeroImage[]
    if (configured.length > 0) return configured.map((h) => h.image_url)

    const { data: kits } = await supabase
      .from('inventory_items')
      .select('image_url')
      .eq('active', true)
      .eq('is_kit', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (kits ?? []).map((k) => k.image_url as string)
  }, [])
}

/** Busca tolerante a erro de digitação — usa a função search_inventory_items
 * (similaridade de trigramas via pg_trgm), então "minie" também encontra
 * "Minnie". */
export async function searchItems(query: string): Promise<InventoryItem[]> {
  const term = query.trim()
  if (!term) return []
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase.rpc('search_inventory_items', { search_term: term })
    return (data ?? []) as InventoryItem[]
  }, [])
}

export async function getAllItemSlugs(): Promise<{ slug: string }[]> {
  return safe(async () => {
    const supabase = createPublicSupabase()
    const { data } = await supabase.from('inventory_items').select('slug').eq('active', true)
    return (data ?? []) as { slug: string }[]
  }, [])
}
