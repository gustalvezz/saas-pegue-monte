import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import ProductCard from '@/components/ProductCard'
import { getCategories, getCategoryItemCounts, getFeaturedItems } from '@/lib/store'

export const revalidate = 300

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://decorafesta.app.br'

export const metadata: Metadata = {
  title: 'Decora Festa | Locação de Decorações para Festas em Jundiaí',
  description:
    'Alugue kits prontos ou monte sua decoração escolhendo os itens que quiser. Balões, painéis, mesas, vasos e muito mais — reserve online em minutos.',
  alternates: { canonical: APP_URL },
  openGraph: {
    title: 'Decora Festa — Locação de Decorações para Festas',
    description: 'Kits prontos ou itens avulsos para locação. Reserve online em minutos.',
    url: APP_URL,
    siteName: 'Decora Festa',
    images: [`${APP_URL}/logo.png`],
    locale: 'pt_BR',
    type: 'website',
  },
}

export default async function HomePage() {
  const [categories, counts, featured] = await Promise.all([
    getCategories(),
    getCategoryItemCounts(),
    getFeaturedItems(8),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Decora Festa',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    description: 'Locação de decorações para festas — kits prontos ou itens avulsos.',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicHeader />

      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-6">
        {/* Hero */}
        <section className="text-center py-8 sm:py-12">
          <h1 className="text-2xl sm:text-4xl font-black leading-tight" style={{ color: 'var(--dark)' }}>
            Decoração de festa, <span style={{ color: 'var(--teal)' }}>pegue e monte</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--mid)' }}>
            Kits prontos ou itens avulsos para locação. Escolha, informe a data do seu evento e reserve online.
          </p>
        </section>

        {/* Categorias */}
        {categories.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-black mb-3" style={{ color: 'var(--dark)' }}>Categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categoria/${c.slug}`}
                  className="rounded-xl p-4 text-center border transition-all hover:shadow-md"
                  style={{ background: '#fff', borderColor: 'var(--border)' }}
                >
                  <p className="font-extrabold text-sm" style={{ color: 'var(--dark)' }}>{c.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--light)' }}>
                    {counts[c.id] ?? 0} {counts[c.id] === 1 ? 'item' : 'itens'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Destaques */}
        <section>
          <h2 className="text-lg font-black mb-3" style={{ color: 'var(--dark)' }}>Destaques</h2>
          {featured.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--mid)' }}>Em breve, novidades por aqui.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featured.map((item) => <ProductCard key={item.id} item={item} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
