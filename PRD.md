# PRD — Decora Festa

**Produto:** Decora Festa
**Tipo:** Micro SaaS de locação de decorações para festas — vitrine pública de reservas + gestão do negócio (inventário, eventos, financeiro, atendimento)
**Proprietária:** Flavia Alves da Silva
**Banco:** C6Bank · Ag. 1 · Conta 177400862
**Versão do documento:** 4.0
**Última atualização:** 2026-08-12
**Status:** Em produção (v3.2, painel interno) · v4.0 (Loja Pública) em planejamento

---

## 1. Visão geral

**O core do produto não é mais controle financeiro — é fechar negócios de locação.** O financeiro é um módulo interno importante (e continua existindo), mas o motor do negócio a partir da v4.0 passa a ser a **vitrine pública**: uma loja online onde qualquer visitante encontra a Decora Festa pelo Google (ou por uma IA de busca), navega o catálogo, monta um pedido de locação (kit pronto + itens avulsos) e envia uma cotação — sem precisar falar com a Flávia antes de saber o que quer.

Sistema web com dois lados:

**Público (novo, v4.0):**
- **Loja / Vitrine** — catálogo indexável no Google e legível por LLMs, com kits prontos e itens avulsos para locação, disponibilidade real por data, e fluxo de cotação sem necessidade de login

**Interno (existente, protegido por login):**
1. **Financeiro** — registrar receitas e despesas, visualizar KPIs e gráficos mensais, exportar relatórios
2. **Atendimento** — chatbot WhatsApp que qualifica leads automaticamente via IA (Evolution API + Claude Haiku)
3. **Inventário** — cadastro de itens físicos de decoração com controle de disponibilidade por período
4. **Eventos / Pedidos** — gestão de locações por evento (incluindo cotações vindas da loja pública), com sincronização com Google Agenda

Acesso ao painel interno exclusivo via login com email/senha (operação single-user — só a Flávia). A loja pública não exige login para o cliente final.

---

## 2. Objetivos

| # | Objetivo | Métrica de sucesso |
|---|---|---|
| 1 | Centralizar receitas e despesas em um único lugar | 100% das transações registradas no sistema |
| 2 | Visualizar resultado financeiro em tempo real | KPIs atualizados a cada operação |
| 3 | Acompanhar evolução mensal | Gráfico comparativo visível no dashboard |
| 4 | Ser usável no celular sem atrito | Mobile-first, PWA instalável |
| 5 | Exportar dados para planilha | CSV disponível com 1 clique |
| 6 | Evitar overbooking de itens de decoração | Disponibilidade calculada automaticamente por período em qualquer novo evento |
| 7 | Manter a agenda do Google como fonte única de compromissos | Eventos confirmados aparecem automaticamente na agenda da Flávia |

---

## 3. Personas

### Flavia (proprietária / único usuário do painel interno)
- Gerencia a empresa de locação de decorações sozinha
- Usa principalmente o celular para registrar transações e cadastrar itens (com foto tirada na hora) no dia a dia
- Precisa saber rapidamente quanto entrou, quanto saiu e qual o saldo do mês
- Precisa saber, ao fechar um novo evento, se tem itens de decoração disponíveis nas datas necessárias
- Quer que os eventos confirmados apareçam automaticamente na sua agenda do Google
- Quer exportar os dados para entregar à contabilidade
- **Nova (v4.0):** quer receber pedidos de locação prontos por email, revisar/ajustar antes de confirmar, e não perder tempo respondendo "qual o preço desse item?" no WhatsApp — a loja já responde isso

### Cliente final (visitante da loja pública) — nova persona v4.0
- Chega pelo Google (busca orgânica), por indicação, ou perguntando pra uma IA tipo ChatGPT/Gemini sobre locação de decoração na região
- Não conhece o catálogo de antemão — quer navegar, ver fotos e preços sem precisar falar com alguém primeiro
- Pode saber exatamente o item que quer, ou só ter uma ideia vaga ("queria algo de dinossauro pro aniversário do meu filho")
- Espera um fluxo rápido: escolher, informar a data do evento, se cadastrar e pronto — sem burocracia, sem precisar criar conta com senha
- Confirma e assina o contrato depois que a Flávia já validou o pedido com ele

---

## 4. Escopo

### 4.1 Funcionalidades incluídas

**Financeiro (v1.0)**

| Funcionalidade | Descrição |
|---|---|
| **Autenticação** | Login com email/senha via Supabase Auth. Sessão persistente. |
| **KPI Cards** | Total Receitas, Total Despesas, Resultado Líquido, Ticket Médio por locação |
| **Gráfico mensal** | Barras Chart.js: Receitas × Despesas × Resultado, agrupado por mês |
| **Top Clientes** | Ranking dos 5 clientes com maior receita de locação |
| **Despesas por Categoria** | Distribuição percentual das despesas por categoria |
| **Tabela de transações** | Lista paginada com filtro por mês e tipo (receita/despesa) |
| **Adicionar/editar/excluir transação** | Modal bottom-sheet com campos: data, tipo, categoria, descrição, valor |
| **Exportar CSV** | Exporta as transações filtradas atualmente exibidas |
| **PWA** | Instalável em celular, funciona offline com cache básico |
| **Mobile First** | Tabela vira cards no mobile; todos os controles tocáveis |

**Atendimento (v2.0)**

| Funcionalidade | Descrição |
|---|---|
| **Chatbot WhatsApp** | Evolution API recebe mensagens. Claude Haiku gera respostas e coleta dados do lead |
| **Coleta de dados** | Bot coleta: nome, tipo de festa, data, convidados, local, tema e orçamento |
| **Takeover automático** | Quando Flávia responde pelo celular (`fromMe: true`), bot é desativado para aquele lead |
| **Dashboard de leads** | Lista com filtro por status, KPIs: novos hoje / em atendimento / qualificados no mês |
| **Histórico de conversa** | Visualização estilo WhatsApp com painel de dados coletados pelo bot |
| **Controle de status** | novo → em_atendimento → qualificado → fechado / perdido |
| **Bot envia fotos** | Bot envia até 2 fotos relevantes do inventário quando tem tipo + tema do evento |
| **Criar evento a partir de lead** | Lead qualificado/fechado gera atalho que pré-preenche formulário de novo evento |

**Inventário + Eventos (v3.0)**

| Funcionalidade | Descrição |
|---|---|
| **Cadastro de item de inventário** | Foto (câmera ou galeria), categoria, material, cor, tamanho, quantidade em estoque, tags, preço de locação e reposição |
| **Busca e filtros de inventário** | Por nome, tag, categoria e material |
| **Disponibilidade por período** | Calcula unidades livres de um item descontando reservas de eventos não cancelados que se sobrepõem ao período consultado |
| **Alocações futuras do item** | Tela de detalhe do item lista os próximos 60 dias de eventos que o reservam |
| **Ativar/desativar item** | Remove da seleção de novos eventos sem apagar histórico |
| **Criação de evento** | Cliente, telefone, tipo de festa, data do evento, datas de retirada/devolução, local, convidados, tema, observações |
| **Seleção de itens do evento** | Picker mostra disponibilidade em tempo real no período do evento, permite ajustar quantidade e preço unitário |
| **Cálculo automático do total** | Soma quantidade × preço unitário de todos os itens do evento |
| **Fluxo de status do evento** | cotação → confirmado → em_andamento → concluído, ou cancelado a qualquer momento |
| **Dashboard de eventos** | Lista com filtro por status e contagem de festas nos próximos 7 dias |

**Google Agenda (v3.1)**

| Funcionalidade | Descrição |
|---|---|
| **Conectar Google Agenda** | OAuth 2.0 com `access_type=offline` + `prompt=consent` para obter refresh token |
| **Sincronização automática** | Ao mudar status do evento para `confirmado` ou `em_andamento`, evento é criado/atualizado na agenda (all-day event) |
| **Remoção automática** | Ao cancelar o evento, o evento correspondente é removido da agenda do Google |
| **Refresh de token** | Token de acesso é renovado automaticamente quando está a menos de 5 minutos de expirar |
| **Desconectar** | Remove os tokens salvos; sincronização para de ocorrer para novos eventos |
| **Falha não-bloqueante** | Erros de sincronização com o Google não impedem a operação principal (mudança de status do evento) |

### 4.2 Fora do escopo

- Multi-usuário / controle de acesso por empresa
- Relatórios PDF
- Notificações push
- Integração bancária automática (Open Finance)
- Emissão de recibos / notas fiscais
- Fechamento de lead criando transação automaticamente no financeiro
- Sincronização bidirecional com o Google Agenda (mudanças feitas direto no Google não voltam para o app)
- Reserva de itens sem vínculo a um evento (bloqueio manual de estoque)

---

## 5. Requisitos funcionais

### RF01 — Autenticação
- O sistema deve exigir login com email e senha antes de qualquer acesso
- Sessão deve ser mantida entre navegações (cookie Supabase)
- Logout disponível no header do dashboard

### RF02 — Dashboard financeiro
- Exibir 4 KPIs calculados sobre **todas** as transações (sem filtro de mês)
- Exibir gráfico de barras com dados agrupados por mês
- Exibir top 5 clientes por valor de locação
- Exibir distribuição de despesas por categoria com percentual

### RF03 — Tabela de transações
- Filtrar por mês (dinâmico — meses disponíveis nos dados)
- Filtrar por tipo: Todos / Receitas / Despesas
- Filtros combinados funcionam juntos
- Exibir subtotal de receitas, despesas e resultado dos itens filtrados

### RF04 — CRUD de transações
- Campos obrigatórios: data, descrição, tipo, categoria, valor
- Valor deve ser positivo (o sinal ± é determinado pelo tipo)
- Salvar atualiza KPIs, gráfico e tabela imediatamente

### RF05 — Exportação CSV
- Exporta exatamente as transações visíveis na tabela (respeitando filtros ativos)
- Colunas: Data, Descrição, Categoria, Tipo, Valor (negativo para despesas)
- Nome do arquivo: `decora_festa_financeiro.csv`

### RF06 — PWA
- `manifest.json` com nome, cores e ícones da marca
- Service worker com cache de páginas principais
- Página `/offline` exibida quando sem conexão

### RF07 — Inventário
- Item exige nome, categoria e foto; quantidade mínima 1
- Disponibilidade de um item em um período = `quantity_total` menos soma de `quantity` de `event_items` cujo evento (a) não está cancelado e (b) tem `pickup_date`/`return_date` sobrepondo o período consultado
- Ao editar um evento existente, a disponibilidade deve excluir as reservas do próprio evento sendo editado

### RF08 — Eventos
- Evento exige cliente, data do evento, data de retirada e data de devolução
- Itens só podem ser adicionados a um evento já criado (não durante a criação inicial)
- Mudança de status para `confirmado` ou `em_andamento` dispara sincronização com Google Agenda (fire-and-forget)
- Mudança de status para `cancelado` dispara remoção do evento na Google Agenda (fire-and-forget)

### RF09 — Google Agenda
- Conexão exige usuário autenticado no Supabase
- Fluxo OAuth usa cookie `google_oauth_state` (httpOnly, SameSite=lax, 10 min de validade) para proteção CSRF
- Se o usuário não tiver conectado o Google, tentativas de sincronização retornam silenciosamente (`ok: false, reason: 'no_google_token'`) sem erro visível

---

## 6. Requisitos não-funcionais

| Requisito | Especificação |
|---|---|
| **Mobile First** | Layout projetado para 375px, expandido para desktop |
| **Performance** | First Load JS < 250 KB nas rotas principais |
| **Segurança** | RLS no Supabase — apenas usuários autenticados acessam dados; tokens do Google isolados por `user_id` |
| **Disponibilidade** | Deploy serverless no Vercel (sem cold start de servidor); dependência do plano free do Supabase, que pausa o projeto após inatividade e limita a 2 projetos ativos simultâneos na conta |
| **Tipagem** | TypeScript strict em todo o código |
| **Timeout de API** | Rotas de webhook/sync configuradas com `maxDuration = 60` no Vercel para acomodar chamadas externas (Claude, Evolution API, Google Calendar) |

---

## 7. Modelo de dados

Todas as tabelas em `public` têm **RLS habilitado**.

### Tabela `transactions`

```sql
id          uuid primary key default gen_random_uuid()
date        date not null
description text not null
type        text not null  -- 'receita' | 'despesa'
category    text not null  -- ver enum abaixo
value       numeric(10,2) not null  -- sempre positivo
created_at  timestamptz not null default now()
```

**Enum `category`:** `Locação` · `Devolução` · `Compra de Decoração` · `Fatura Cartão` · `Outros`

### Tabela `leads`

```sql
id              uuid primary key
phone           text unique not null
name            text
status          text  -- novo | em_atendimento | qualificado | fechado | perdido
event_type      text  -- aniversário | casamento | chá_bebê | debutante | outros
event_date      date
guest_count     int
venue           text
budget_range    text  -- até R$500 | R$500-R$1000 | R$1000-R$2000 | R$2000+
theme_notes     text
bot_active      bool default true
created_at      timestamptz
last_message_at timestamptz
```

### Tabela `conversations`

```sql
id            uuid primary key
lead_id       uuid fk → leads.id
direction     text  -- inbound | outbound
message_text  text
media_url     text
wa_message_id text unique
created_at    timestamptz
```

### Tabela `inventory_items`

```sql
id                 uuid primary key
name               text not null
description        text
category           text  -- aniversário | casamento | chá_bebê | debutante | outros
color              text
size_description   text
material           text  -- ceramica | plastico | mdf | acrilico | led | tecido | lona | outros
tags               text[] default '{}'
image_url          text not null
quantity_total     int not null default 1  -- check > 0
replacement_price  numeric(10,2)
rental_price_unit  numeric(10,2)
active             bool default true
created_at         timestamptz
```

> Substitui a antiga tabela `catalog_items` (migration 003) — mantida no histórico de migrations, mas o produto usa `inventory_items` desde a v3.0.

### Tabela `events`

```sql
id               uuid primary key
lead_id          uuid fk → leads.id (nullable)
client_name      text not null
client_phone     text
event_type       text
event_date       date not null
pickup_date      date not null
return_date      date not null
venue            text
theme_notes      text
guest_count      int
status           text default 'cotacao'  -- cotacao | confirmado | em_andamento | concluido | cancelado
notes            text
google_event_id  text  -- id do evento correspondente no Google Calendar
created_at       timestamptz
```

### Tabela `event_items`

```sql
id                  uuid primary key
event_id            uuid fk → events.id
inventory_item_id   uuid fk → inventory_items.id
quantity            int not null  -- check > 0
unit_price          numeric(10,2) not null  -- check >= 0
created_at          timestamptz
```

### Tabela `google_tokens`

```sql
id             uuid primary key default gen_random_uuid()
user_id        uuid fk → auth.users.id, unique
access_token   text not null
refresh_token  text not null
expires_at     timestamptz not null
created_at     timestamptz not null default now()
updated_at     timestamptz not null default now()
```

**Política RLS:** `authenticated` → `auth.uid() = user_id` (cada usuário só acessa seu próprio token)

**Políticas RLS (demais tabelas):** `authenticated` → acesso total (select, insert, update, delete)

---

## 8. Arquitetura

```
Browser (PWA)
    │
    ├── Next.js 14 App Router (Vercel — serverless)
    │   ├── /login                              → autenticação
    │   ├── /dashboard                          → financeiro (client component)
    │   ├── /dashboard/atendimento               → lista de leads
    │   ├── /dashboard/atendimento/[id]          → conversa + dados do lead
    │   ├── /dashboard/inventario                → grid de itens
    │   ├── /dashboard/inventario/[id]           → detalhe + alocações futuras
    │   ├── /dashboard/eventos                   → lista de eventos
    │   ├── /dashboard/eventos/[id]               → detalhe/edição + itens + status
    │   ├── /api/webhook/whatsapp                → webhook Evolution API (POST)
    │   ├── /api/auth/google[...]                → fluxo OAuth Google Calendar
    │   ├── /api/calendar/sync                   → cria/atualiza/remove evento no Google
    │   └── /offline                             → fallback PWA
    │
    ├── Supabase
    │   ├── Auth (email/senha)
    │   ├── PostgreSQL (transactions, leads, conversations, inventory_items,
    │   │                events, event_items, google_tokens)
    │   └── Storage (bucket "catalog" — fotos públicas do inventário)
    │
    ├── Evolution API (serviço Docker separado, ex: Render)
    │   └── WhatsApp Web → webhook → /api/webhook/whatsapp
    │
    ├── Anthropic API (Claude Haiku) — geração de respostas do chatbot
    │
    └── Google Calendar API — CRUD de eventos na agenda da Flávia
```

**Fluxo do chatbot:**
1. Lead envia mensagem no WhatsApp da Flávia
2. Evolution API dispara POST no webhook `/api/webhook/whatsapp?secret=...`
3. Webhook salva mensagem, busca histórico, chama Claude Haiku
4. Claude retorna resposta + dados estruturados do lead (em JSON)
5. Webhook salva resposta, atualiza lead, envia texto via Evolution API
6. Se `suggestCatalog=true`, busca fotos relevantes do inventário e envia também
7. Se Flávia responde pelo celular → `fromMe=true` → `bot_active=false` → Flávia assume

**Fluxo financeiro:**
1. Flávia loga → Supabase Auth valida sessão
2. Dashboard carrega → `supabase.from('transactions').select('*')`
3. CRUD → insert/update/delete via Supabase JS SDK
4. Após mutação → refetch imediato

**Fluxo de evento + inventário:**
1. Flávia cria evento com datas de retirada/devolução
2. Ao adicionar itens, `ItemPicker` consulta disponibilidade real (`getItemsWithAvailability`) descontando reservas conflitantes
3. Itens confirmados são salvos em `event_items`; total do evento é somado no client
4. Ao mudar status para `confirmado`/`em_andamento`, `POST /api/calendar/sync` cria/atualiza o evento no Google Agenda (não bloqueia a UI em caso de falha)
5. Ao cancelar, o mesmo endpoint remove o evento da agenda

**Fluxo de conexão com Google Agenda:**
1. Flávia clica em "Conectar Agenda" → `GET /api/auth/google` gera `state` CSRF e redireciona ao consentimento do Google
2. Google redireciona para `/api/auth/google/callback` com `code` + `state`
3. Callback valida `state` contra o cookie, troca `code` por tokens, salva em `google_tokens` (upsert por `user_id`)
4. Chamadas futuras de sincronização usam `getValidToken`, que renova o `access_token` automaticamente via `refresh_token` quando necessário

---

## 9. Design system

### Cores

| Token | Hex | Uso |
|---|---|---|
| `--teal` | `#4ECDC4` | Primária, receitas, CTA principal |
| `--coral` | `#FF6B6B` | Despesas, erros, alertas |
| `--green-dark` | `#5CB85C` | Resultado positivo, valores de receita |
| `--purple-dark` | `#9B6BC4` | Ticket médio, botão editar, módulo Eventos |
| `--orange-brand` | `#FFAB76` | Categoria Devolução, módulo Inventário |
| `--dark` | `#22223B` | Textos principais, header tabela |
| `--mid` | `#66667A` | Textos secundários |
| `--bg` | `#FFF8FC` | Background geral |

### Tipografia
- Família: **Nunito** (Google Fonts)
- Pesos usados: 400, 600, 700, 800, 900

### Componentes principais
- **KPI Card** — border-top colorida, ícone decorativo, valor grande
- **Pill de categoria/status** — tag colorida por categoria ou status do evento/lead
- **Availability Badge** — indicador verde/laranja/vermelho de unidades disponíveis
- **Modal de form** — bottom-sheet no mobile, dialog centralizado no desktop
- **Item Picker** — modal de seleção de itens de inventário com disponibilidade em tempo real
- **Filtros** — botões pill com estado ativo colorido por contexto

---

## 10. Roadmap

### v4.0 — Loja Pública (próxima, prioridade máxima)
Plano completo na seção 11. Resumo das fases:
- [x] Fase 1 — Fundação pública (schema, RLS pública, páginas de catálogo/produto/kit com SEO completo)
- [ ] Fase 2 — Fluxo de pedido (seletor de itens, cadastro do cliente, cotação pendente, email via Resend)
- [ ] Fase 3 — Dashboard de pedidos pendentes
- [ ] Fase 4 — Contrato em PDF + assinatura eletrônica simples + sync automático com Google Agenda
- [ ] Fase 5 — Assistente de busca por IA (reutilizável no WhatsApp depois)

### v3.3 (backlog do painel interno, depois da loja)
- [ ] Fechamento de lead → gerar transação de Locação automaticamente no financeiro
- [ ] Relatório de conversão: leads recebidos → qualificados → fechados
- [ ] Notificação no dashboard quando novo lead qualificado (badge no header)
- [ ] Carregar seed de dados históricos automaticamente em novos ambientes

### Concluído
- [x] Módulo financeiro — CRUD, KPIs, gráfico, PWA, mobile-first (v1.0)
- [x] Módulo Atendimento — chatbot WhatsApp via Evolution API + Claude (v2.0)
- [x] Catálogo de fotos do inventário enviado pelo bot (v2.0)
- [x] Módulo Inventário com controle de disponibilidade por período (v3.0)
- [x] Módulo Eventos com seleção de itens e cálculo automático de total (v3.0)
- [x] Sincronização de eventos com Google Agenda via OAuth 2.0 (v3.1)
- [x] Migração de deploy Render → Vercel (v3.2)

### Backlog (sem data definida)
- [ ] Filtro por intervalo de datas (date range picker) na tabela de transações
- [ ] Campo de busca na tabela de transações
- [ ] Indicador de saldo atual da conta bancária (campo editável no header)
- [ ] Confirmação de exclusão mais elegante (toast em vez de `confirm()`)
- [ ] Gráfico de pizza para distribuição de categorias
- [ ] Resumo mensal exportável (PDF simples)
- [ ] Nota / observação por transação (campo opcional)
- [ ] Multi-usuário com isolamento de dados por `user_id`
- [ ] Integração com Pix / Open Finance para importação automática
- [ ] Sincronização bidirecional com Google Agenda
- [ ] Bloqueio manual de estoque sem vínculo a evento

---

## 11. Loja Pública — Plano v4.0 (planejado, ainda não implementado)

Esta seção documenta as decisões de produto já fechadas para a vitrine pública, antes de qualquer implementação. Nada aqui existe em código ainda — é o plano acordado.

### 11.1 Conceito

Vitrine pública em `decorafesta.app.br` (domínio raiz) onde o cliente final navega o catálogo — **kits prontos** (ex: "Kit Hotwheels Pegue e Monte") e **itens avulsos** — e monta um pedido de locação. Sem carrinho multi-produto e sem pagamento online na v4.0: o fluxo é **linear, um kit/item principal por vez**, com a possibilidade de agregar itens extras àquela seleção antes de enviar como cotação pendente.

O painel interno da Flávia (`/login`, `/dashboard/*`) não muda de lugar nem de comportamento — continua exatamente como está hoje.

### 11.2 Kits

- Um kit é cadastrado como um item normal do inventário (`inventory_items`, novo campo `is_kit boolean`) — tem nome, foto, categoria, preço de locação próprio e aparece no catálogo como qualquer outro item.
- Nova tabela `kit_items` (`kit_id → inventory_items.id`, `component_item_id → inventory_items.id`, `quantity`) define o que compõe o kit — exibido na página do kit como "Conteúdo do kit" (nome + foto + referência de cada componente, sem preço individual).
- **Disponibilidade do kit** = pior disponibilidade entre todos os componentes no período escolhido, considerando a quantidade de kits pedida — reaproveita a lógica já existente em `src/lib/inventory.ts`, estendida para iterar sobre os componentes do kit.
- **Diferencial vs. concorrente:** na página do kit, o cliente pode adicionar itens extras à seleção (ex: um arco de balão, um painel a mais) — ver 11.4.

### 11.3 Fluxo do cliente (linear, sem carrinho multi-produto)

1. Visitante entra no catálogo (`/`, `/categoria/[slug]`) ou cai direto numa página de produto/kit vinda do Google
2. Na página do kit/item, escolhe a **data do evento** — o sistema valida disponibilidade real naquele período (a vitrine mostra tudo do catálogo sem exigir data antes; a checagem de disponibilidade só acontece quando a data é informada)
3. Opcionalmente adiciona itens extras à seleção (seletor visual ou assistente por IA — ver 11.4)
4. Revisa o resumo (kit + extras + valor total)
5. Se cadastra: **nome, endereço, CPF, telefone, email** (dados usados depois para gerar o contrato)
6. Envia — isso cria uma cotação pendente no banco (não é uma reserva confirmada ainda)
7. Vê uma tela de confirmação simples ("recebemos seu pedido, a Flávia vai confirmar disponibilidade e falar com você")

### 11.4 Adicionar itens extras — seletor visual + assistente por IA

Os dois convivem, não é um ou outro:

- **Seletor visual (base, sempre disponível):** grid com busca/filtro por categoria, foto, preço e disponibilidade já considerando a data escolhida — é essencialmente o `ItemPicker` que já existe para uso interno da Flávia, exposto publicamente sem exigir login, reaproveitando `getItemsWithAvailability`.
- **Assistente por IA (diferencial, opcional):** botão visível ("✨ Não sabe o que procura? Pergunte pra gente") abre um modal (quase tela cheia no mobile, modal grande no desktop) com um chat. O cliente descreve em linguagem natural ("um arco de balão dourado"), e o Claude usa uma **ferramenta de busca real** (`buscar_itens(termo, categoria?)`, tool calling — mesmo padrão do `chatbot.ts`) que consulta o Supabase de verdade (nome, tags, categoria, preço, disponibilidade na data escolhida). A resposta sempre renderiza **cards reais** dos itens encontrados (nunca texto inventado) com botão "adicionar".
- Essa ferramenta de busca é desenhada como **módulo independente e reutilizável** — não fica amarrada só à loja. Fica pronta pra, numa atualização futura, ser plugada no `chatbot.ts` do WhatsApp também (upgrade da busca por tags simples que existe hoje pra busca por linguagem natural de verdade), com a ressalva de que no WhatsApp a resposta vira texto + fotos (Evolution API não tem cards interativos), não um clique de "adicionar".

### 11.5 Do pedido ao contrato assinado

Modelo de referência real fornecido pela Flávia: `docs/contrato-modelo.pdf` — usado como template para a geração do PDF (cláusulas fixas, campos de partes/locação/lista de itens).

1. Cotação pendente cria uma linha em `events` (reaproveitando o fluxo de status que já existe: `cotacao → confirmado → em_andamento → concluido`/`cancelado`), vinculada a um novo registro em `customers`
2. Flávia recebe **notificação por email** (Resend) avisando do novo pedido
3. No dashboard, nova tela **"Pedidos pendentes"** lista as cotações vindas da loja — Flávia pode editar itens, data, dados do cliente antes de confirmar (ela tem autorização total pra ajustar o pedido)
4. Ela combina os detalhes com o cliente pelo WhatsApp
5. Ao clicar **"Finalizar"**: sistema gera o PDF do contrato (modelo fornecido pela Flávia) e cria um **link de assinatura** público (rota tipo `/assinar/[token]`, sem necessidade de login)
6. Cliente abre o link, revisa o PDF, assina (canvas de assinatura simples — ver 11.6) — contrato fica selado, evento muda pra `confirmado`, e **sincroniza automaticamente com o Google Agenda** (reaproveitando `/api/calendar/sync`, que já existe)

### 11.6 Assinatura digital (v4.0 — assinatura eletrônica simples, embutida)

- Canvas de assinatura no navegador (ex: lib `signature_pad`) — cliente desenha a assinatura
- Trilha de auditoria salva junto: nome digitado, IP, user-agent, timestamp
- Assinatura (imagem) é "carimbada" no PDF via `pdf-lib` e tudo fica salvo no Supabase Storage
- Nível de **assinatura eletrônica simples** (reconhecida pela Lei 14.063/2020) — não é ICP-Brasil. Suficiente para contratos desse porte; migrar para ZapSign/Clicksign (assinatura com validade jurídica mais forte) fica como upgrade de v2, trocando só esse módulo, sem mudar arquitetura.

### 11.7 SEO e leitura por LLM (requisito transversal, não uma fase separada)

Toda página pública precisa nascer com isso — não é polimento de depois:

| Requisito | Como |
|---|---|
| **Server-rendered** | Páginas públicas são Server Components (SSR/SSG com ISR), não `'use client'` — diferente do padrão atual do dashboard, que é 100% client-side. Necessário pra crawler de busca e de LLM lerem o HTML puro, sem depender de JS rodar |
| **URL limpa e indexável** | `inventory_items` ganha campo `slug` (único, gerado do nome, editável pela Flávia). Rotas: `/produto/[slug]`, `/categoria/[slug]` — nunca UUID na URL |
| **Metadados por página** | `generateMetadata()` dinâmico por produto/categoria: `title`, `description` (a partir da descrição do item, enriquecida — ver abaixo), Open Graph (`og:image` = foto do item, `og:title`, `og:description`), Twitter Card |
| **Dados estruturados (JSON-LD)** | Schema.org `Product` em cada página de item/kit: nome, imagem, descrição, `offers` (preço, `priceCurrency: BRL`, disponibilidade), categoria — é o que alimenta rich results do Google e dá contexto estruturado pra LLMs |
| **Descrição enriquecida** | Campo `description` de `inventory_items` passa a ser tratado como conteúdo de verdade (material, cor, tamanho, ocasião, o que combina), não um texto opcional e curto — entra na meta description, no JSON-LD e no corpo da página |
| **`sitemap.xml`** | Gerado dinamicamente (`app/sitemap.ts`) listando toda página de produto/kit/categoria |
| **`robots.txt`** | Libera rotas públicas, bloqueia `/dashboard`, `/api`, `/login` |
| **`llms.txt`** | Arquivo na raiz descrevendo o negócio e as páginas principais, no formato que agentes de IA/LLM crawlers já sabem ler |
| **HTML semântico** | Hierarquia de headings correta, `alt` descritivo em toda foto de item (não nome de arquivo) |
| **Imagem otimizada** | Páginas públicas usam `next/image` (diferente do `<img>` simples usado hoje no admin) — impacta Core Web Vitals, que também é fator de ranking |
| **Canonical + `lang="pt-BR"`** | URL canônica por página; idioma já correto no `<html>` |

### 11.8 Categorias × Tags (decidido)

- **Categorias = tipo de produto** (Balões, Mesas, Painéis, Vasos, Pegue e Monte…), confirmadas como a taxonomia de navegação da loja. Substitui o enum antigo `category` de `inventory_items` (que era tipo de festa) **como categoria** — tipo de festa não serve pra classificar o item.
- **Tipo de festa/ocasião vira tag**, não categoria — `aniversário`, `casamento`, `chá de bebê`, `debutante`, `infantil`, `menina`, `menino`, `adulto`, `15 anos` etc. viram valores de um vocabulário de **tags pré-cadastradas** (a Flávia escolhe de uma lista ao cadastrar o item, não digita livre — evita "menina" vs "menininha" inconsistente).
- `inventory_items.tags` (já existe como `text[]`) continua sendo o campo de armazenamento — sem mudança de schema aí, sem precisar reescrever a lógica de busca por overlap que já existe. O que muda é a **origem dos valores**: uma nova tabela `tag_options` alimenta um seletor/autocomplete no formulário de item, em vez de um campo de texto livre.
- O enum `event_type` que já existe em `leads` (atendimento/chatbot) **não muda** — é um conceito diferente (dado coletado sobre o lead, não categorização de produto).

### 11.9 Modelo de dados — resumo das adições

Campos adicionais abaixo vieram da leitura do modelo de contrato real fornecido (`docs/contrato-modelo.pdf`) — o rascunho anterior não tinha frete, sinal/restante, tipo de espaço, nem os dois horários (entrega × devolução).

| Tabela/campo | Tipo | Descrição |
|---|---|---|
| `inventory_items.is_kit` | `boolean` | Marca item como kit |
| `inventory_items.slug` | `text` unique | URL limpa e indexável |
| `inventory_items.category_id` | `uuid` FK | Substitui o enum antigo `category` |
| `kit_items` (nova) | — | Componentes de um kit (kit_id, component_item_id, quantity) |
| `categories` (nova) | — | Taxonomia por tipo de produto (Balões, Mesas, Painéis, Pegue e Monte…) |
| `tag_options` (nova) | — | Vocabulário pré-cadastrado de tags (infantil, menina, menino, adulto, 15 anos…), alimenta o seletor no admin |
| `customers` (nova) | — | nome, CPF, RG (opcional), telefone, email, endereço completo, pessoa de referência (nome + telefone, opcional) |
| `events.customer_id` | `uuid` FK | Vincula evento ao cliente cadastrado na loja |
| `events.pickup_time` | `time` | Horário de entrega/retirada dos itens |
| `events.return_deadline_time` | `time` | Horário-limite de devolução |
| `events.space_type` | `text` | `interno` \| `externo` \| `misto` |
| `events.delivery_fee` | `numeric(10,2)` | Frete de entrega (separado do valor dos itens) |
| `events.return_shipping` | `text` | `locataria` \| `locadora` \| `retirada_locadora` — quem cuida do frete de devolução |
| `events.deposit_amount` | `numeric(10,2)` | Sinal (50% do valor, conforme cláusula 9ª do contrato) |
| `contracts` (nova) | — | PDF gerado, imagem da assinatura, IP/user-agent/timestamp, token de assinatura, `event_id` FK |
| RLS de `inventory_items` | policy nova | Leitura pública (`anon`) de itens ativos — hoje é só `authenticated` |

**Sobre o contrato:** os campos "Estado na Saída" e "Conferido" da tabela de itens no modelo são preenchidos manualmente na entrega física (não fazem parte do fluxo de assinatura digital — ficam em branco no PDF gerado, igual ao modelo). A coluna de preço no contrato usa o **valor de reposição** (`replacement_price`, já existe em `inventory_items`), não o preço de locação. Dados da Locadora (Flávia — nome e CPF) são fixos/configuráveis, não vêm do pedido. Testemunhas ficam opcionais/em branco no fluxo digital.

### 11.10 Fases de implementação sugeridas

| Fase | Entrega |
|---|---|
| **1 — Fundação pública** | Migrations (slug, is_kit, kit_items, categories, tag_options, customers, campos de contrato em events), RLS pública de leitura, páginas de catálogo/produto/kit com SEO completo (11.7), sitemap, robots, llms.txt |
| **2 — Fluxo de pedido** | Seletor visual de itens extras, cadastro do cliente, geração da cotação pendente (`events` + `customers` + `event_items`), email pra Flávia via Resend |
| **3 — Dashboard de pedidos** | Tela "Pedidos pendentes" — editar, confirmar, cancelar cotações vindas da loja |
| **4 — Contrato + assinatura** | Geração de PDF, link de assinatura público, canvas de assinatura + trilha de auditoria, sync automático com Google Agenda ao finalizar |
| **5 — Assistente por IA** | Ferramenta de busca compartilhada (`buscar_itens`), modal de chat na loja — desenhada para reuso futuro no WhatsApp |

---

## 12. Histórico de versões do PRD

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-05-20 | Documento inicial — v1.0 do produto (módulo financeiro) |
| 2.0 | 2026-05-21 | Módulo Atendimento — chatbot WhatsApp (Evolution API + Claude Haiku), catálogo de fotos, novas tabelas leads/conversations/catalog_items |
| 3.0 | 2026-07-23 | Documenta módulos Inventário e Eventos (tabelas `inventory_items`, `events`, `event_items`) que já estavam implementados desde 2026-06-16 mas não documentados |
| 3.1 | 2026-07-23 | Documenta integração com Google Agenda via OAuth 2.0 (tabela `google_tokens`, fluxo de sincronização) |
| 3.2 | 2026-07-23 | Atualiza arquitetura e requisitos não-funcionais para refletir a migração de deploy Render → Vercel |
| 4.0 | 2026-08-12 | Reposiciona o produto (core = fechar negócios via vitrine pública, não controle financeiro) e documenta o plano completo da Loja Pública: kits, fluxo de cotação sem carrinho, assistente por IA reutilizável, assinatura eletrônica, requisitos de SEO/LLM, modelo de dados e fases de implementação — planejado, ainda não implementado |
| 4.1 | 2026-08-12 | Fase 1 implementada: fundação de dados (categorias, tags, kits) e vitrine pública (home, categoria, produto/kit) com SEO. Busca livre com tolerância a erro de digitação. Redesign visual da loja com paleta/tipografia próprias, "como funciona" editorial, diferenciais, FAQ (`FAQPage` JSON-LD), footer e `LocalBusiness` JSON-LD site-wide — itens além do plano original de 11, incorporados a partir de um template de referência que a proprietária testou |
