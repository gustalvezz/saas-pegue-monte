import Link from 'next/link'
import Image from 'next/image'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511973110669'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Oi! Vim pelo site e queria saber mais sobre a locação de decorações 🎈')}`

export default function PublicHeader() {
  return (
    <header style={{ background: '#fff', borderBottom: '1.5px solid var(--border)' }}>
      {/* Barra superior */}
      <div className="text-center text-xs font-bold py-1.5" style={{ background: 'var(--dark)', color: '#fff' }}>
        📍 Jundiaí · SP &nbsp;·&nbsp; Reserve online em minutos
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.png" alt="Decora Festa" width={140} height={103} className="h-11 w-auto" priority />
        </Link>

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
    </header>
  )
}
