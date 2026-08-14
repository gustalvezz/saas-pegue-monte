import Eyebrow from '@/components/Eyebrow'

const ITEMS = [
  { title: 'Mais econômico que comprar', text: 'Alugue só o que vai usar na festa, pelo tempo do evento.' },
  { title: 'Sem decoração sobrando em casa', text: 'Depois da festa, é só devolver — sem guardar balão murcho ou painel de MDF.' },
  { title: 'Pegue e monte, do seu jeito', text: 'Você escolhe os itens, retira e monta seguindo nosso guia simples.' },
  { title: 'Variedade de temas e estilos', text: 'De festas infantis lúdicas a decorações elegantes para casamento e empresas.' },
]

export default function Differentials() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <Eyebrow>Por que a Decora Festa</Eyebrow>
          <h2 className="font-display text-2xl font-semibold mb-5" style={{ color: 'var(--store-ink)' }}>
            Decoração completa, sem o trabalho de comprar tudo
          </h2>
          <ul className="space-y-4">
            {ITEMS.map((item) => (
              <li key={item.title} className="flex gap-3 items-start">
                <span
                  className="w-7 h-7 min-w-7 rounded-full flex items-center justify-center text-xs font-black mt-0.5"
                  style={{ background: 'var(--store-teal)', color: '#fff' }}
                >
                  ✓
                </span>
                <div>
                  <strong className="block text-sm" style={{ color: 'var(--store-ink)' }}>{item.title}</strong>
                  <span className="text-sm" style={{ color: 'var(--store-ink-soft)' }}>{item.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-3xl p-8 sm:p-10 flex items-center justify-center text-center min-h-[280px]"
          style={{ background: 'linear-gradient(155deg, var(--store-purple-l), var(--store-pink-l))' }}
        >
          <div className="rounded-2xl p-7 sm:p-9 max-w-xs shadow-lg" style={{ background: 'var(--store-paper)' }}>
            <p className="font-display italic text-lg" style={{ color: 'var(--store-ink)' }}>
              &ldquo;Alugue, monte, celebre — e devolva. Sua festa incrível começa aqui.&rdquo;
            </p>
            <p className="text-xs mt-3" style={{ color: 'var(--store-ink-soft)' }}>— Decora Festa</p>
          </div>
        </div>
      </div>
    </section>
  )
}
