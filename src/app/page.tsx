import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import HeroCarousel from '@/components/HeroCarousel'
import HeroSearchBar from '@/components/HeroSearchBar'
import HowItWorks from '@/components/HowItWorks'
import FeaturedCategoryTabs from '@/components/FeaturedCategoryTabs'
import { getCategories, getHeroImages, getItemsGroupedByCategory } from '@/lib/store'

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
  const [categories, itemsByCategory, heroImages] = await Promise.all([
    getCategories(),
    getItemsGroupedByCategory(10),
    getHeroImages(4),
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

      <div className="relative max-w-6xl mx-auto px-3 sm:px-5 pt-4">
        <HeroCarousel images={heroImages} />
        <HeroSearchBar />
      </div>

      {/* Hero */}
      <section className="text-center py-5 sm:py-7 px-3">
        <h1 className="text-2xl sm:text-4xl font-black leading-tight" style={{ color: 'var(--dark)' }}>
          Decoração de festa, <span style={{ color: 'var(--teal)' }}>pegue e monte</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--mid)' }}>
          Kits prontos ou itens avulsos para locação. Escolha, informe a data do seu evento e reserve online.
        </p>
      </section>

      <HowItWorks />

      <main className="max-w-6xl mx-auto px-3 sm:px-5 pb-10">
        <FeaturedCategoryTabs categories={categories} itemsByCategory={itemsByCategory} />
      </main>
    </div>
  )
}
