import { MetadataRoute } from 'next'
import { getAllItemSlugs, getCategories } from '@/lib/store'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://decorafesta.app.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, items] = await Promise.all([getCategories(), getAllItemSlugs()])

  return [
    { url: APP_URL, changeFrequency: 'daily', priority: 1 },
    ...categories.map((c) => ({
      url: `${APP_URL}/categoria/${c.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...items.map((i) => ({
      url: `${APP_URL}/produto/${i.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
