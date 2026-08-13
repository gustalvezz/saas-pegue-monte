import { createServerSupabase } from '@/lib/supabase-server'
import { InventoryItem, InventoryItemWithCategory, KitItemWithDetail, ProductCategory } from '@/lib/types'

/** Consultas públicas do catálogo (loja) — usam o client server-side, que
 * respeita as policies de leitura pública (anon) configuradas no Supabase.
 * Toda função tolera falha de rede/banco (ex: build sem credenciais reais,
 * instabilidade momentânea do Supabase) devolvendo um resultado vazio em
 * vez de derrubar a página ou o build inteiro. */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function getCategories(): Promise<ProductCategory[]> {
  return safe(async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('categories').select('*').order('name')
    return (data ?? []) as ProductCategory[]
  }, [])
}

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  return safe(async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle()
    return data as ProductCategory | null
  }, null)
}

export async function getCategoryItemCounts(): Promise<Record<string, number>> {
  return safe(async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('inventory_items').select('category_id').eq('active', true)
    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      if (!row.category_id) continue
      counts[row.category_id] = (counts[row.category_id] ?? 0) + 1
    }
    return counts
  }, {})
}

export async function getItemsByCategory(categoryId: string): Promise<InventoryItem[]> {
  return safe(async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('active', true)
      .eq('category_id', categoryId)
      .order('name')
    return (data ?? []) as InventoryItem[]
  }, [])
}

export async function getFeaturedItems(limit = 8): Promise<InventoryItem[]> {
  return safe(async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []) as InventoryItem[]
  }, [])
}

export async function getItemBySlug(slug: string): Promise<InventoryItemWithCategory | null> {
  return safe(async () => {
    const supabase = createServerSupabase()
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
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('kit_items')
      .select('*, component:inventory_items!kit_items_component_item_id_fkey(*)')
      .eq('kit_id', kitId)
    return (data ?? []) as KitItemWithDetail[]
  }, [])
}

export async function getRelatedItems(categoryId: string | null, excludeId: string, limit = 4): Promise<InventoryItem[]> {
  return safe(async () => {
    const supabase = createServerSupabase()
    let query = supabase.from('inventory_items').select('*').eq('active', true).neq('id', excludeId).limit(limit)
    if (categoryId) query = query.eq('category_id', categoryId)
    const { data } = await query
    return (data ?? []) as InventoryItem[]
  }, [])
}

export async function getAllItemSlugs(): Promise<{ slug: string }[]> {
  return safe(async () => {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('inventory_items').select('slug').eq('active', true)
    return (data ?? []) as { slug: string }[]
  }, [])
}
