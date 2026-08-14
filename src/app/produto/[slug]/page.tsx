import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import PublicHeader from '@/components/PublicHeader'
import ProductCard from '@/components/ProductCard'
import Footer from '@/components/Footer'
import { getAllItemSlugs, getItemBySlug, getKitComponents, getRelatedItems, getTagOptions } from '@/lib/store'
import { formatBRL } from '@/lib/utils'
import { TagOption } from '@/lib/types'

export const revalidate = 300

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://decorafesta.app.br'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = await getAllItemSlugs()
  return slugs.map((s) => ({ slug: s.slug }))
}

function buildDescription(item: { description: string | null; name: string; color: string | null; size_description: string | null; is_kit: boolean }) {
  if (item.description) return item.description
  const parts = [
    item.is_kit ? `Kit ${item.name}` : item.name,
    item.color ? `na cor ${item.color}` : null,
    item.size_description ? `tamanho ${item.size_description}` : null,
  ].filter(Boolean)
  return `${parts.join(', ')} — disponível para locação na Decora Festa.`
}

/** Traduz os slugs de tag do item (ex: "toy-story") em nomes de exibição
 * (ex: "Toy Story"), a partir do vocabulário pré-cadastrado. */
function resolveTagNames(itemTags: string[], allTags: TagOption[]): string[] {
  const bySlug = new Map(allTags.map((t) => [t.slug, t.name]))
  return itemTags.map((slug) => bySlug.get(slug) ?? slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getItemBySlug(params.slug)
  if (!item) return {}

  const allTags = await getTagOptions()
  const tagNames = resolveTagNames(item.tags, allTags)

  const baseDescription = buildDescription(item)
  const description = tagNames.length > 0
    ? `${baseDescription} Tema: ${tagNames.join(', ')}.`
    : baseDescription
  const title = `${item.name} — Decoração para Festa | Decora Festa`

  return {
    title,
    description,
    keywords: tagNames.length > 0 ? tagNames : undefined,
    alternates: { canonical: `${APP_URL}/produto/${item.slug}` },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/produto/${item.slug}`,
      images: [item.image_url],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const item = await getItemBySlug(params.slug)
  if (!item) notFound()

  const [kitComponents, related, allTags] = await Promise.all([
    item.is_kit ? getKitComponents(item.id) : Promise.resolve([]),
    getRelatedItems(item.category_id, item.id, 4),
    getTagOptions(),
  ])

  const description = buildDescription(item)
  const tagNames = resolveTagNames(item.tags, allTags)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description,
    image: item.image_url,
    category: item.category?.name,
    keywords: tagNames.length > 0 ? tagNames.join(', ') : undefined,
    offers: item.rental_price_unit != null ? {
      '@type': 'Offer',
      price: item.rental_price_unit,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: `${APP_URL}/produto/${item.slug}`,
    } : undefined,
  }

  return (
    <div className="min-h-screen store-bg">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PublicHeader />

      <main className="max-w-5xl mx-auto px-3 sm:px-5 py-6">
        <nav className="text-xs mb-3" style={{ color: 'var(--store-ink-soft)' }} aria-label="breadcrumb">
          <Link href="/" style={{ color: 'var(--store-ink-soft)' }}>Início</Link>
          {item.category && (
            <> / <Link href={`/categoria/${item.category.slug}`} style={{ color: 'var(--store-ink-soft)' }}>{item.category.name}</Link></>
          )}
          {' / '}{item.name}
        </nav>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1 / 1', background: 'var(--store-paper)' }}>
            <SafeImage src={item.image_url} alt={item.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" priority />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {item.is_kit && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold" style={{ background: 'var(--store-purple-l)', color: 'var(--store-purple)' }}>
                  Kit
                </span>
              )}
              {item.category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold" style={{ background: '#D8F0EC', color: 'var(--store-teal-d)' }}>
                  {item.category.name}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--store-ink)' }}>{item.name}</h1>

            {item.rental_price_unit != null && (
              <p className="text-2xl font-black mb-4" style={{ color: 'var(--store-teal-d)' }}>
                {formatBRL(item.rental_price_unit)}
              </p>
            )}

            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--store-ink-soft)' }}>{description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {item.color && (
                <div>
                  <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--store-ink-soft)' }}>Cor</p>
                  <p style={{ color: 'var(--store-ink)' }}>{item.color}</p>
                </div>
              )}
              {item.size_description && (
                <div>
                  <p className="text-xs font-extrabold uppercase" style={{ color: 'var(--store-ink-soft)' }}>Tamanho</p>
                  <p style={{ color: 'var(--store-ink)' }}>{item.size_description}</p>
                </div>
              )}
            </div>

            {tagNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tagNames.map((name) => (
                  <span key={name} className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--store-blush)', color: 'var(--store-ink-soft)' }}>
                    #{name}
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              disabled
              className="block w-full text-center py-3 rounded-xl text-white font-extrabold text-sm opacity-50 cursor-not-allowed"
              style={{ background: 'var(--store-teal-d)' }}
            >
              Fazer pedido (em breve)
            </button>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--store-ink-soft)' }}>
              A reserva online chega na próxima atualização da loja.
            </p>
          </div>
        </div>

        {/* Conteúdo do kit */}
        {item.is_kit && kitComponents.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--store-ink)' }}>Conteúdo do kit</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--store-ink-soft)' }}>Este kit reúne {kitComponents.length} itens</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {kitComponents.map((k) => (
                <div key={k.id} className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--store-line)', background: 'var(--store-paper)' }}>
                  <div className="relative" style={{ aspectRatio: '1 / 1' }}>
                    <SafeImage src={k.component.image_url} alt={k.component.name} fill sizes="200px" className="object-cover" />
                  </div>
                  <p className="text-xs font-bold px-2 py-1.5 truncate" style={{ color: 'var(--store-ink)' }}>
                    {k.quantity}x {k.component.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Itens relacionados */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold mb-3" style={{ color: 'var(--store-ink)' }}>Você também pode gostar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {related.map((r) => <ProductCard key={r.id} item={r} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
