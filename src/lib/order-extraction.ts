import Anthropic from '@anthropic-ai/sdk'
import { searchItems } from '@/lib/store'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/** Ferramenta de busca no catálogo — compartilhada entre esta extração (a
 * partir de conversas do WhatsApp) e, futuramente, o assistente de busca da
 * loja pública e o próprio chatbot do WhatsApp. Nunca deixa a IA inventar um
 * item: ela só pode referenciar o que essa busca real retornar. */
const CATALOG_SEARCH_TOOL: Anthropic.Tool = {
  name: 'buscar_itens',
  description: 'Busca itens do catálogo de decoração (kits ou itens avulsos) por nome, tema ou personagem mencionado na conversa. Retorna id, nome, se é kit e preço de locação.',
  input_schema: {
    type: 'object',
    properties: {
      termo: { type: 'string', description: 'Termo de busca — nome do item, tema ou personagem' },
    },
    required: ['termo'],
  },
}

async function runCatalogSearchTool(termo: string) {
  const items = await searchItems(termo)
  return items.slice(0, 5).map((i) => ({
    id: i.id,
    name: i.name,
    is_kit: i.is_kit,
    rental_price_unit: i.rental_price_unit,
  }))
}

const SYSTEM_PROMPT = `Você organiza pedidos de locação de decoração da Decora Festa a partir de conversas de WhatsApp entre a proprietária e clientes.

Leia a conversa (marcada como "Cliente:" ou "Flávia:") e extraia os dados do evento sendo negociado. Use a ferramenta buscar_itens para identificar quais produtos do catálogo real estão sendo discutidos — NUNCA invente um item ou id que não veio da ferramenta. Se não tiver certeza de qual item bate com o que foi mencionado, não inclua.

Quando terminar de usar as ferramentas necessárias, responda APENAS com um JSON (sem texto antes ou depois, sem markdown) neste formato exato:
{
  "client_name": string ou null,
  "event_type": um de "aniversário"|"casamento"|"chá_bebê"|"debutante"|"outros", ou null,
  "event_date": "AAAA-MM-DD" ou null,
  "venue": string ou null,
  "theme_notes": string ou null,
  "guest_count": number ou null,
  "items": [{ "item_id": "uuid-retornado-pela-busca", "quantity": number }],
  "missing_fields": string[] — dados necessários pro contrato que NÃO apareceram na conversa, escolhidos entre "cpf", "rg", "email", "endereco"
}

Use "null" para qualquer campo que não apareceu claramente na conversa. Não invente datas, nomes ou locais.`

export interface ExtractedOrder {
  client_name: string | null
  event_type: string | null
  event_date: string | null
  venue: string | null
  theme_notes: string | null
  guest_count: number | null
  items: { item_id: string; quantity: number }[]
  missing_fields: string[]
}

/** Lê a transcrição de uma conversa do WhatsApp e devolve um rascunho de
 * pedido estruturado, pronto pra Flávia revisar — nunca cria nada sozinho,
 * só extrai e sugere. */
export async function extractOrderFromConversation(transcript: string): Promise<ExtractedOrder | null> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: `Conversa:\n\n${transcript}` },
  ]

  for (let turn = 0; turn < 5; turn++) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [CATALOG_SEARCH_TOOL],
      messages,
    })

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )

    if (toolUses.length === 0) {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) return null
        return JSON.parse(jsonMatch[0]) as ExtractedOrder
      } catch {
        return null
      }
    }

    messages.push({ role: 'assistant', content: response.content })

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const toolUse of toolUses) {
      const input = toolUse.input as { termo: string }
      const results = await runCatalogSearchTool(input.termo)
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(results),
      })
    }
    messages.push({ role: 'user', content: toolResults })
  }

  return null
}
