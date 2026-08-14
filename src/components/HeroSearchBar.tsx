export default function HeroSearchBar() {
  return (
    <form
      action="/busca"
      method="GET"
      className="relative sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 mt-3 sm:mt-0 w-full sm:max-w-md"
    >
      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg" style={{ background: 'var(--store-paper)' }}>
        <span className="text-base" aria-hidden>🔍</span>
        <input
          type="search"
          name="q"
          placeholder="O que você quer alugar hoje?"
          className="flex-1 min-w-0 text-sm font-semibold outline-none bg-transparent"
          style={{ color: 'var(--store-ink)' }}
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-full text-white text-xs font-extrabold flex-shrink-0"
          style={{ background: 'var(--store-teal-d)' }}
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
