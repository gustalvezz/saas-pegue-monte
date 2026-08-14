import Link from 'next/link'
import Image from 'next/image'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511973110669'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Oi! Vim pelo site e queria saber mais sobre a locação de decorações 🎈')}`

const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#categorias', label: 'Categorias' },
]

export default function PublicHeader() {
  return (
    <header style={{ background: '#fff', borderBottom: '1.5px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.png" alt="Decora Festa" width={140} height={103} className="h-11 w-auto" priority />
        </Link>

        <nav className="hidden sm:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold transition-colors"
              style={{ color: 'var(--mid)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-xs font-extrabold flex-shrink-0"
          style={{ background: '#25D366' }}
        >
          💬 Fale no WhatsApp
        </a>
      </div>

      {/* Nav do mobile — linha separada, rolável */}
      <nav className="sm:hidden flex items-center gap-4 overflow-x-auto scrollbar-hide px-3 pb-3">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-bold flex-shrink-0"
            style={{ color: 'var(--mid)' }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
