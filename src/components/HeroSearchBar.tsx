export default function HeroSearchBar() {
  return (
    <form
      action="/busca"
      method="GET"
      className="absolute left-1/2 top-1/2 w-[92%] sm:w-full sm:max-w-md"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg" style={{ background: '#fff' }}>
        <span className="text-base" aria-hidden>🔍</span>
        <input
          type="search"
          name="q"
          placeholder="O que você quer alugar hoje?"
          className="flex-1 min-w-0 text-sm font-semibold outline-none bg-transparent"
          style={{ color: 'var(--dark)' }}
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 rounded-full text-white text-xs font-extrabold flex-shrink-0"
          style={{ background: 'var(--teal)' }}
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
