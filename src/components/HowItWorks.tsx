const STEPS = [
  { icon: '🎈', title: 'Escolha', text: 'Navegue o catálogo, monte um kit ou pegue um já pronto' },
  { icon: '📅', title: 'Informe a data', text: 'O sistema já mostra se está disponível pro seu evento' },
  { icon: '💬', title: 'Confirme com a gente', text: 'A Flávia valida tudo com você pelo WhatsApp' },
  { icon: '🎉', title: 'Retire ou receba', text: 'No dia combinado, é só aproveitar a festa' },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="max-w-6xl mx-auto px-3 sm:px-5 py-8 scroll-mt-20">
      <h2 className="text-lg font-black text-center mb-5" style={{ color: 'var(--dark)' }}>Como funciona</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="rounded-2xl p-4 text-center relative"
            style={{ background: '#fff', border: '1.5px solid var(--border)' }}
          >
            <span
              className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'var(--teal)', color: '#fff' }}
            >
              {i + 1}
            </span>
            <p className="text-2xl mb-2">{step.icon}</p>
            <p className="font-extrabold text-sm mb-1" style={{ color: 'var(--dark)' }}>{step.title}</p>
            <p className="text-xs leading-snug" style={{ color: 'var(--mid)' }}>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
