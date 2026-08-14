import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import HeroCarousel from '@/components/HeroCarousel'
import HeroSearchBar from '@/components/HeroSearchBar'
import MarqueeStrip from '@/components/MarqueeStrip'
import HowItWorks from '@/components/HowItWorks'
import Differentials from '@/components/Differentials'
import FeaturedCategoryTabs from '@/components/FeaturedCategoryTabs'
import FAQSection, { buildFaqJsonLd } from '@/components/FAQSection'
import Footer from '@/components/Footer'
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

  const faqJsonLd = buildFaqJsonLd()

  return (
    <div className="min-h-screen store-bg">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <PublicHeader />

      <div className="relative max-w-6xl mx-auto px-3 sm:px-5 pt-4">
        <HeroCarousel images={heroImages} />
        <HeroSearchBar />
      </div>

      {/* Hero */}
      <section className="text-center py-5 sm:py-7 px-3">
        <h1 className="font-display text-2xl sm:text-4xl font-semibold leading-tight" style={{ color: 'var(--store-ink)' }}>
          Decoração de festa, <span className="font-script text-3xl sm:text-5xl" style={{ color: 'var(--store-pink)' }}>pegue e monte</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--store-ink-soft)' }}>
          Kits prontos ou itens avulsos para locação. Escolha, informe a data do seu evento e reserve online.
        </p>
      </section>

      <MarqueeStrip />

      <main className="max-w-6xl mx-auto px-3 sm:px-5">
        <HowItWorks />
        <Differentials />
        <FeaturedCategoryTabs categories={categories} itemsByCategory={itemsByCategory} />
        <FAQSection />
      </main>

      <Footer />
    </div>
  )
}
