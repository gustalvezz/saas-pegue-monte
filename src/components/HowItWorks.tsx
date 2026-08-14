import Eyebrow from '@/components/Eyebrow'

const STEPS = [
  { mod: 'PASSO 01', title: 'Escolha', text: 'Navegue o catálogo, monte um kit ou pegue um já pronto.' },
  { mod: 'PASSO 02', title: 'Informe a data', text: 'O sistema já mostra se está disponível pro seu evento.' },
  { mod: 'PASSO 03', title: 'Confirme com a gente', text: 'Nossa equipe valida tudo com você pelo WhatsApp.' },
  { mod: 'PASSO 04', title: 'Retire ou receba', text: 'No dia combinado, é só aproveitar a festa.' },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-10 scroll-mt-20">
      <Eyebrow>O sistema Decora Festa</Eyebrow>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--store-ink)' }}>
        Pegue e monte, do seu jeito
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mt-8">
        {STEPS.map((step) => (
          <div key={step.mod}>
            <span
              className="block text-xs font-bold tracking-wider mb-2"
              style={{ fontFamily: "ui-monospace, 'SF Mono', 'Courier New', monospace", color: 'var(--store-teal-d)' }}
            >
              {step.mod}
            </span>
            <h3 className="font-display text-lg font-semibold mb-1.5" style={{ color: 'var(--store-ink)' }}>{step.title}</h3>
            <p className="text-sm" style={{ color: 'var(--store-ink-soft)' }}>{step.text}</p>
            <div className="h-px mt-4" style={{ background: 'linear-gradient(90deg, var(--store-gold), transparent)' }} />
          </div>
        ))}
      </div>
    </section>
  )
}
