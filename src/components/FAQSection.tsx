import Eyebrow from '@/components/Eyebrow'

export const FAQ_ITEMS = [
  {
    question: 'O que é o sistema pegue e monte?',
    answer: 'É a forma mais econômica de alugar decoração: você escolhe os itens do catálogo, retira tudo já organizado e monta no local do evento seguindo um guia simples. Depois da festa, é só devolver.',
  },
  {
    question: 'Quais tipos de festa vocês atendem?',
    answer: 'Atendemos festas infantis, festas adultas, chá revelação, casamentos, aniversários e eventos corporativos.',
  },
  {
    question: 'Como faço um orçamento?',
    answer: 'Pelo WhatsApp — basta informar a data, o tipo de festa e o tema desejado para receber sua proposta.',
  },
  {
    question: 'Com quanto tempo de antecedência preciso reservar?',
    answer: 'O ideal é reservar com o máximo de antecedência possível, principalmente em datas concorridas como fins de semana e feriados, para garantir a disponibilidade dos itens escolhidos.',
  },
  {
    question: 'O que acontece se algum item for danificado?',
    answer: 'Itens danificados são cobrados pelo valor de reposição, conforme combinado no contrato de locação — tudo alinhado com você antes da confirmação do pedido.',
  },
]

export function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export default function FAQSection() {
  return (
    <section id="duvidas" className="py-8 scroll-mt-20">
      <div className="text-center mb-6">
        <Eyebrow>Dúvidas frequentes</Eyebrow>
        <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--store-ink)' }}>
          Perguntas sobre o aluguel de decoração
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-2.5">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="rounded-2xl px-4"
            style={{ background: 'var(--store-paper)', border: '1.5px solid var(--store-line)' }}
          >
            <summary className="cursor-pointer list-none py-3.5 font-bold text-sm flex items-center justify-between gap-3" style={{ color: 'var(--store-ink)' }}>
              {item.question}
              <span aria-hidden style={{ color: 'var(--store-gold)' }}>+</span>
            </summary>
            <p className="text-sm pb-4" style={{ color: 'var(--store-ink-soft)' }}>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
