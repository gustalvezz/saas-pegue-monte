import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/store'

export default async function PublicHeader() {
  const categories = await getCategories()

  return (
    <header style={{ background: '#fff', borderBottom: '1.5px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center gap-4">
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.png" alt="Decora Festa" width={140} height={103} className="h-11 w-auto" priority />
        </Link>
        <nav className="flex-1 overflow-x-auto scrollbar-hide">
          <ul className="flex items-center gap-1 whitespace-nowrap">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categoria/${c.slug}`}
                  className="inline-block px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{ color: 'var(--mid)' }}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
