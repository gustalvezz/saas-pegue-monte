import Anthropic from '@anthropic-ai/sdk'
import { Lead, Conversation } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é a assistente virtual da Decora Festa, empresa de locação de decorações para festas da Flávia Alves. Seu nome é Deco.

Seu objetivo é conversar naturalmente com clientes potenciais e coletar as seguintes informações antes de transferir para a Flávia:
1. Nome do cliente
2. Tipo de festa (aniversário, casamento, chá de bebê, debutante ou outros)
3. Data do evento
4. Número estimado de convidados
5. Local do evento (casa, salão, sítio, etc.)
6. Tema ou cores preferidas para a decoração
7. Orçamento estimado (até R$500 / R$500-R$1000 / R$1000-R$2000 / R$2000+)

Regras:
- Tom caloroso, festivo e brasileiro. Use emojis com moderação.
- Faça no máximo 2 perguntas por mensagem para não sobrecarregar o cliente.
- Quando souber o tipo de festa e o tema, mencione que vai mostrar alguns exemplos de decoração.
- Quando tiver coletado pelo menos 6 dos 7 dados acima, encerre com uma mensagem de transferência calorosa.
- Nunca invente preços, disponibilidade ou detalhes do catálogo.
- Nunca mencione que é um robô/bot, a menos que perguntado diretamente.
- Se o cliente perguntar diretamente se é robô, seja honesta: "Sou a Deco, assistente virtual da Decora Festa! A Flávia está disponível em breve."

Quando todos os dados forem coletados (ou após a 8ª mensagem da conversa), retorne EXATAMENTE este JSON no final da sua resposta, após a mensagem para o cliente:
DADOS_LEAD:{"nome":"...","tipo_festa":"...","data":"...","convidados":0,"local":"...","tema":"...","orcamento":"...","qualificado":true}

Use "null" para campos não informados. O campo "qualificado" só deve ser true quando tiver pelo menos nome, tipo_festa e data.`

interface BotResponse {
  message: string
  leadData: Partial<Lead> | null
  qualified: boolean
  suggestCatalog: boolean
}

export async function generateBotResponse(
  lead: Partial<Lead>,
  history: Conversation[],
  newMessage: string
): Promise<BotResponse> {
  const messages: Anthropic.MessageParam[] = history.slice(-10).map((c) => ({
    role: c.direction === 'inbound' ? 'user' : 'assistant',
    content: c.message_text ?? '',
  }))

  messages.push({ role: 'user', content: newMessage })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages,
  })

  const fullText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('')

  const dataMatch = fullText.match(/DADOS_LEAD:(\{[\s\S]+?\})/)
  let leadData: Partial<Lead> | null = null
  let qualified = false
  let cleanMessage = fullText

  if (dataMatch) {
    try {
      const parsed = JSON.parse(dataMatch[1])
      qualified = parsed.qualificado === true
      cleanMessage = fullText.replace(/DADOS_LEAD:\{[\s\S]+?\}/, '').trim()

      leadData = {
        name: parsed.nome ?? null,
        event_type: parsed.tipo_festa ?? null,
        event_date: parsed.data ?? null,
        guest_count: parsed.convidados ? parseInt(parsed.convidados) : null,
        venue: parsed.local ?? null,
        theme_notes: parsed.tema ?? null,
        budget_range: parsed.orcamento ?? null,
      }
    } catch {
      // JSON parse failed — ignore structured data
    }
  }

  const suggestCatalog =
    !!(lead.event_type || leadData?.event_type) &&
    !!(lead.theme_notes || leadData?.theme_notes)

  return { message: cleanMessage, leadData, qualified, suggestCatalog }
}
