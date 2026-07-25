# PRD — Decora Festa · Dashboard Financeiro

**Produto:** Decora Festa
**Tipo:** Micro SaaS · Controle Financeiro, Inventário e Eventos
**Proprietária:** Flavia Alves da Silva
**Banco:** C6Bank · Ag. 1 · Conta 177400862
**Versão do documento:** 3.2
**Última atualização:** 2026-07-23
**Status:** Em produção (v3.2 — deploy no Vercel)

---

## 1. Visão geral

Sistema web para uma **empresa de locação de decorações para festas**. Módulos:
1. **Financeiro** — registrar receitas e despesas, visualizar KPIs e gráficos mensais, exportar relatórios
2. **Atendimento** — chatbot WhatsApp que qualifica leads automaticamente via IA (Evolution API + Claude Haiku)
3. **Inventário** — cadastro de itens físicos de decoração com controle de disponibilidade por período
4. **Eventos** — gestão de locações por evento, com seleção de itens do inventário e sincronização com Google Agenda

Acesso exclusivo via login com email/senha (operação single-user).

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

### Flavia (proprietária / único usuário)
- Gerencia a empresa de locação de decorações sozinha
- Usa principalmente o celular para registrar transações e cadastrar itens (com foto tirada na hora) no dia a dia
- Precisa saber rapidamente quanto entrou, quanto saiu e qual o saldo do mês
- Precisa saber, ao fechar um novo evento, se tem itens de decoração disponíveis nas datas necessárias
- Quer que os eventos confirmados apareçam automaticamente na sua agenda do Google
- Quer exportar os dados para entregar à contabilidade

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

### v3.3 (próxima)
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

## 11. Histórico de versões do PRD

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-05-20 | Documento inicial — v1.0 do produto (módulo financeiro) |
| 2.0 | 2026-05-21 | Módulo Atendimento — chatbot WhatsApp (Evolution API + Claude Haiku), catálogo de fotos, novas tabelas leads/conversations/catalog_items |
| 3.0 | 2026-07-23 | Documenta módulos Inventário e Eventos (tabelas `inventory_items`, `events`, `event_items`) que já estavam implementados desde 2026-06-16 mas não documentados |
| 3.1 | 2026-07-23 | Documenta integração com Google Agenda via OAuth 2.0 (tabela `google_tokens`, fluxo de sincronização) |
| 3.2 | 2026-07-23 | Atualiza arquitetura e requisitos não-funcionais para refletir a migração de deploy Render → Vercel |
