import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import { getCategories, getCategoryBySlug, getItemsByCategory } from '@/lib/store'

export const revalidate = 300

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://decorafesta.app.br'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)
  if (!category) return {}

  const title = `${category.name} para Locação | Decora Festa`
  const description = `Alugue itens de ${category.name.toLowerCase()} para sua festa. Confira o catálogo completo com fotos, preços e disponibilidade.`

  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}/categoria/${category.slug}` },
    openGraph: { title, description, url: `${APP_URL}/categoria/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategoryBySlug(params.slug)
  if (!category) notFound()

  const items = await getItemsByCategory(category.id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: APP_URL },
      { '@type': 'ListItem', position: 2, name: category.name, item: `${APP_URL}/categoria/${category.slug}` },
    ],
  }

  return (
    <div className="min-h-screen store-bg">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicHeader />

      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-6">
        <nav className="text-xs mb-3" style={{ color: 'var(--store-ink-soft)' }} aria-label="breadcrumb">
          <Link href="/" style={{ color: 'var(--store-ink-soft)' }}>Início</Link> / {category.name}
        </nav>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-1" style={{ color: 'var(--store-ink)' }}>{category.name}</h1>
        <p className="text-sm mb-5" style={{ color: 'var(--store-ink-soft)' }}>
          {items.length} {items.length === 1 ? 'item disponível' : 'itens disponíveis'} para locação
        </p>

        {items.length === 0 ? (
          <p className="text-sm py-10 text-center" style={{ color: 'var(--store-ink-soft)' }}>
            Nenhum item nessa categoria ainda.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item) => <ProductCard key={item.id} item={item} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
