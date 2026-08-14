import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import { searchItems } from '@/lib/store'

interface Props {
  searchParams: { q?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q?.trim() ?? ''
  return {
    title: q ? `Busca por "${q}" | Decora Festa` : 'Buscar | Decora Festa',
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? ''
  const results = q ? await searchItems(q) : []

  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511973110669'
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Oi! Procurei "${q}" no site e não achei — vocês têm algo parecido? 🎈`
  )}`

  return (
    <div className="min-h-screen store-bg">
      <PublicHeader />

      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-6">
        <nav className="text-xs mb-3" style={{ color: 'var(--store-ink-soft)' }} aria-label="breadcrumb">
          <Link href="/" style={{ color: 'var(--store-ink-soft)' }}>Início</Link> / Busca
        </nav>

        <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--store-ink)' }}>
          {q ? `Resultados para "${q}"` : 'O que você está procurando?'}
        </h1>

        {q && (
          <p className="text-sm mb-5" style={{ color: 'var(--store-ink-soft)' }}>
            {results.length} {results.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>
        )}

        {q && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm font-bold mb-4" style={{ color: 'var(--store-ink-soft)' }}>
              Não encontramos nada com esse termo — mas talvez tenhamos algo parecido.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-sm font-extrabold"
              style={{ background: 'var(--store-teal-d)' }}
            >
              💬 Perguntar no WhatsApp
            </a>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map((item) => <ProductCard key={item.id} item={item} />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
