import Link from 'next/link'
import Image from 'next/image'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511973110669'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Oi! Vim pelo site e queria saber mais sobre a locação de decorações 🎈')}`

const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/#categorias', label: 'Categorias' },
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#duvidas', label: 'Dúvidas' },
]

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0012.01 22C17.53 22 22 17.52 22 12S17.53 2 12.01 2zm5.78 14.13c-.24.68-1.4 1.3-1.93 1.37-.5.07-1.06.1-3.4-.72-2.86-1.02-4.7-3.9-4.85-4.08-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.08.99-2.37.26-.28.57-.35.76-.35h.55c.18 0 .42-.03.64.5.24.57.8 1.97.87 2.11.07.14.11.3.02.49-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.28.71 1.19 1.53 1.94 1.05.96 1.94 1.27 2.21 1.41.28.14.44.12.6-.07.16-.19.68-.8.87-1.07.18-.28.36-.23.6-.14.24.09 1.55.74 1.82.87.26.14.44.2.5.32.07.12.07.68-.17 1.35z" />
    </svg>
  )
}

export default function PublicHeader() {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{ background: 'rgba(247,236,230,0.9)', borderBottom: '1px solid var(--store-line)' }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.png" alt="Decora Festa" width={140} height={103} className="h-11 w-auto" priority />
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--store-ink)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-bold flex-shrink-0 transition-transform hover:-translate-y-0.5"
          style={{ background: 'var(--store-teal-d)', boxShadow: '0 12px 25px -10px rgba(62,158,147,.65)' }}
        >
          <WhatsAppIcon />
          <span className="hidden xs:inline">WhatsApp</span>
        </a>
      </div>

      {/* Nav do mobile — linha separada, rolável */}
      <nav className="sm:hidden flex items-center gap-4 overflow-x-auto scrollbar-hide px-3 pb-3">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-bold flex-shrink-0"
            style={{ color: 'var(--store-ink-soft)' }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
