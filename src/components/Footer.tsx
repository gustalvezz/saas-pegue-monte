import Image from 'next/image'
import Link from 'next/link'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511973110669'
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com/decorafesta.jundiai'

export default function Footer() {
  return (
    <footer className="py-10 text-center" style={{ borderTop: '1px solid var(--store-line)' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-5">
        <Link href="/" className="inline-block mb-3">
          <Image src="/logo.png" alt="Decora Festa" width={140} height={103} className="h-12 w-auto mx-auto" />
        </Link>

        <nav className="flex flex-wrap justify-center gap-5 text-sm font-bold mb-4" style={{ color: 'var(--store-ink)' }}>
          <Link href="/#categorias">Categorias</Link>
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/#duvidas">Dúvidas</Link>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
        </nav>

        <p className="text-xs" style={{ color: 'var(--store-ink-soft)' }}>
          © {new Date().getFullYear()} Decora Festa — Aluguel de decoração para festas em Jundiaí e região.
        </p>
      </div>
    </footer>
  )
}
