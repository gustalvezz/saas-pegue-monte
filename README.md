# 🎈 Decora Festa · Dashboard Financeiro

Micro SaaS para controle financeiro de empresa de **locação de decorações para festas**.
Gerencia receitas, despesas, inventário, eventos e exibe KPIs e gráficos mensais.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS + CSS Variables |
| Gráficos | Chart.js + react-chartjs-2 |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | **Vercel** (serverless — funções de API com `maxDuration` estendido) |
| PWA | Web App Manifest + Service Worker |
| WhatsApp API | Evolution API (auto-hospedado no Render, serviço separado) |
| IA Chatbot | Anthropic Claude Haiku (`@anthropic-ai/sdk`) |
| Agenda | Google Calendar API (OAuth 2.0) |

---

## Funcionalidades

- **Login** com email/senha via Supabase Auth
- **Dashboard** com 4 KPIs: Total Receitas, Total Despesas, Resultado Líquido, Ticket Médio
- **Gráfico mensal** de barras: Receitas × Despesas × Resultado
- **Top Clientes** e **Despesas por Categoria** (sidebar)
- **Tabela de transações** — filtro por mês e por tipo (receita/despesa)
- **CRUD completo** — adicionar, editar e excluir transações
- **Exportar CSV** das transações filtradas
- **PWA** — instalável em celular, funciona offline (cache)
- **Mobile First** — tabela vira cards no celular

### Atendimento (WhatsApp Chatbot)

- **Chatbot IA** via Evolution API + Claude Haiku — coleta automaticamente: nome, tipo de festa, data, convidados, local, tema e orçamento
- **Takeover automático** — quando a Flávia responde pelo WhatsApp no celular, o bot é desativado automaticamente para aquele lead (detecta `fromMe: true`)
- **Dashboard de leads** com KPIs (novos hoje, em atendimento, qualificados no mês) e filtro por status
- **Histórico de conversa** com visualização estilo WhatsApp e painel de dados do lead
- **Controle de status** — novo → em atendimento → qualificado → fechado/perdido
- **Criar evento a partir de lead qualificado** — atalho que pré-preenche o formulário de novo evento

### Inventário

- **Cadastro de itens físicos** — foto (câmera do celular ou galeria), categoria, material, cor, tamanho, quantidade em estoque, preço de locação e de reposição
- **Busca e filtros** — por nome, tag, categoria e material
- **Disponibilidade em tempo real** — calculada por período, descontando itens já reservados em outros eventos que não sejam cancelados
- **Alocações futuras** — cada item mostra os próximos eventos (60 dias) que o reservam
- **Ativar/desativar** item sem excluir o histórico

### Eventos

- **Criação de evento** — cliente, tipo de festa, data, datas de retirada/devolução, local, convidados, tema, observações
- **Seleção de itens do inventário** com checagem de disponibilidade no período do evento (`ItemPicker`)
- **Cálculo automático do valor total** do evento a partir dos itens selecionados
- **Fluxo de status** — cotação → confirmado → em andamento → concluído (ou cancelado)
- **Sincronização com Google Agenda** — ao confirmar/iniciar um evento, ele é criado/atualizado na agenda do Google da Flávia; ao cancelar, é removido (sincronização não bloqueante — falha silenciosamente sem travar o app)

### Catálogo de decorações

- Unificado com o módulo Inventário (`/dashboard/catalogo` redireciona para `/dashboard/inventario`)
- **Bot envia fotos** relevantes do inventário durante a conversa com o lead

### Categorias de transações

`Locação` · `Devolução` · `Compra de Decoração` · `Fatura Cartão` · `Outros`

---

## Cores da marca

| Nome | Hex |
|---|---|
| Teal | `#4ECDC4` |
| Coral | `#FF6B6B` |
| Verde | `#95E1A3` |
| Roxo | `#B39DDB` |
| Laranja | `#FFAB76` |

---

## Banco de dados (Supabase)

Todas as tabelas têm **RLS habilitado**. Migrations em `supabase/migrations/`, aplicadas em ordem numérica:

| Migration | Tabela(s) | Descrição |
|---|---|---|
| `001_create_transactions.sql` | `transactions` | Módulo financeiro |
| `002_leads_conversations.sql` | `leads`, `conversations` | Módulo Atendimento (chatbot WhatsApp) |
| `003_catalog.sql` | `catalog_items` | Catálogo inicial (substituído pelo Inventário) |
| `004_extend_inventory.sql` | `inventory_items` | Extensão do catálogo para inventário físico (material, tamanho, quantidade, preços) |
| `005_events.sql` | `events`, `event_items` | Módulo Eventos e itens alocados por evento |
| `006_google_calendar.sql` | `google_tokens` + coluna `events.google_event_id` | Tokens OAuth do Google Calendar por usuário |

### Tabela `transactions`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` PK | gerado automaticamente |
| `date` | `date` | data da transação |
| `description` | `text` | cliente ou fornecedor |
| `type` | `text` | `receita` ou `despesa` |
| `category` | `text` | uma das 5 categorias |
| `value` | `numeric(10,2)` | valor positivo |
| `created_at` | `timestamptz` | timestamp de criação |

---

## Configuração local

### 1. Clone e instale

```bash
git clone https://github.com/gustalvezz/saas-pegue-monte.git
cd saas-pegue-monte
npm install
```

### 2. Variáveis de ambiente

Crie `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# URL pública do app (usada nos redirects do OAuth do Google)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Chatbot WhatsApp (opcional — necessário para o módulo Atendimento)
EVOLUTION_API_URL=https://evolution.seuapp.onrender.com
EVOLUTION_API_KEY=sua_chave_api
EVOLUTION_INSTANCE_NAME=decora-festa
EVOLUTION_WEBHOOK_SECRET=token_secreto_qualquer
ANTHROPIC_API_KEY=sk-ant-...

# Google Calendar (opcional — necessário para sincronização de eventos)
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

### 3. Banco de dados

No SQL Editor do Supabase, execute em ordem todos os arquivos de `supabase/migrations/` (001 → 006), e depois, opcionalmente:

```sql
-- Dados históricos de exemplo (Mar–Mai 2026)
supabase/seed.sql
```

Crie também o bucket `catalog` no Supabase Storage com acesso público (para as fotos do inventário).

### 4. Criar usuário

No painel Supabase → **Authentication → Users → Add user** (marque "Auto Confirm User").

### 5. Rodar localmente

```bash
npm run dev
# http://localhost:3000
```

---

## Deploy no Vercel

1. Importe o repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente no dashboard do projeto (Settings → Environment Variables), aplicando ao ambiente **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → URL de produção do Vercel (ex: `https://saas-pegue-monte.vercel.app`)
   - `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`, `EVOLUTION_WEBHOOK_SECRET`
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. Deploy — o Vercel detecta Next.js automaticamente (`npm install && npm run build`)

> **Importante:** variáveis `NEXT_PUBLIC_*` são embutidas no build. Qualquer alteração nelas exige um novo deploy (Redeploy), não basta salvar no dashboard.

Depois do primeiro deploy, atualize:
- **Google Cloud Console** → OAuth Client → Authorized redirect URIs → `https://SEU-DOMINIO.vercel.app/api/auth/google/callback`
- **Webhook da Evolution API** → `https://SEU-DOMINIO.vercel.app/api/webhook/whatsapp?secret=EVOLUTION_WEBHOOK_SECRET`

### Evolution API (serviço separado, fora do Vercel)

A Evolution API mantém uma sessão persistente do WhatsApp Web (WebSocket + QR code), o que **não é compatível com funções serverless**. Por isso ela continua rodando como serviço próprio no Render (ou outro host com processo "always-on"), independente do deploy do app no Vercel:

- **Image Docker:** `atendai/evolution-api:latest`
- Após deploy, criar instância e escanear QR code com o WhatsApp da Flávia
- Configurar o webhook da instância para `https://SEU-DOMINIO.vercel.app/api/webhook/whatsapp?secret=EVOLUTION_WEBHOOK_SECRET`

### Supabase — plano gratuito

Projetos no free tier do Supabase pausam automaticamente após período de inatividade, e a conta tem limite de **2 projetos ativos simultâneos**. Se o app parar de responder (ex: login falhando sem erro claro), verifique primeiro se o projeto está pausado no painel do Supabase.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                              # redirect → /login ou /dashboard
│   ├── layout.tsx                            # meta PWA + service worker
│   ├── globals.css                           # CSS variables + Tailwind base
│   ├── login/page.tsx                        # tela de login
│   ├── offline/page.tsx                      # fallback PWA offline
│   ├── dashboard/page.tsx                    # dashboard financeiro principal
│   ├── dashboard/atendimento/page.tsx        # lista de leads WhatsApp
│   ├── dashboard/atendimento/[leadId]/       # conversa + dados do lead
│   ├── dashboard/inventario/page.tsx         # grid de itens do inventário
│   ├── dashboard/inventario/[itemId]/        # detalhe do item + alocações futuras
│   ├── dashboard/eventos/page.tsx            # lista de eventos
│   ├── dashboard/eventos/[eventId]/          # detalhe/edição de evento + itens + status
│   ├── dashboard/catalogo/page.tsx           # redirect → /dashboard/inventario
│   ├── api/webhook/whatsapp/route.ts         # webhook Evolution API
│   ├── api/auth/google/route.ts              # inicia OAuth do Google Calendar
│   ├── api/auth/google/callback/route.ts     # troca code por tokens, salva no Supabase
│   ├── api/auth/google/disconnect/route.ts   # remove tokens do Google
│   ├── api/calendar/sync/route.ts            # cria/atualiza/remove evento no Google Agenda
│   └── api/health/route.ts                   # healthcheck
├── components/
│   ├── KPICards.tsx              # 4 cards de KPI financeiro
│   ├── MonthlyChart.tsx          # gráfico Chart.js
│   ├── SideStats.tsx             # top clientes + categorias
│   ├── TransactionForm.tsx       # modal add/edit transação
│   ├── TransactionTable.tsx      # tabela + mobile cards
│   ├── LeadCard.tsx              # card de lead com status badge
│   ├── ChatBubble.tsx            # bolha de mensagem WhatsApp
│   ├── CatalogUpload.tsx         # upload de foto (legado, ver InventoryItemForm)
│   ├── InventoryItemCard.tsx     # card de item do inventário (grid)
│   ├── InventoryItemForm.tsx     # modal add/edit item (com captura de foto)
│   ├── AvailabilityBadge.tsx     # badge de disponibilidade (X/Y disp.)
│   ├── EventCard.tsx             # card de evento na listagem
│   └── ItemPicker.tsx            # modal de seleção de itens p/ evento com disponibilidade
└── lib/
    ├── types.ts               # interfaces TypeScript
    ├── utils.ts               # formatBRL, KPIs, CSV, etc.
    ├── supabase-client.ts     # cliente browser
    ├── supabase-server.ts     # cliente server (SSR com cookies)
    ├── supabase-admin.ts      # cliente admin (service role, webhook)
    ├── evolution-api.ts       # wrapper Evolution API (WhatsApp)
    ├── chatbot.ts             # Claude Haiku — geração de respostas
    ├── catalog.ts             # busca de itens relevantes p/ o bot enviar
    ├── inventory.ts           # disponibilidade de itens por período, conflitos
    └── google-calendar.ts     # wrapper Google Calendar API (OAuth, CRUD de eventos)
supabase/
├── migrations/
│   ├── 001_create_transactions.sql
│   ├── 002_leads_conversations.sql
│   ├── 003_catalog.sql
│   ├── 004_extend_inventory.sql
│   ├── 005_events.sql
│   └── 006_google_calendar.sql
└── seed.sql
public/
├── manifest.json             # PWA manifest
├── sw.js                     # service worker
└── icons/
.github/workflows/keep-alive.yml  # ping periódico na Evolution API (Render free tier)
```

---

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm start        # inicia servidor de produção
npm run lint     # ESLint
```

---

## Histórico de versões

| Versão | Data | Descrição |
|---|---|---|
| 1.0.0 | 2026-05-20 | Versão inicial — CRUD, KPIs, gráfico, PWA, mobile-first |
| 2.0.0 | 2026-05-21 | Módulo Atendimento — chatbot WhatsApp via Evolution API + Claude, catálogo de fotos |
| 3.0.0 | 2026-06-16 | Módulo Inventário (substitui catálogo simples) + módulo Eventos com controle de disponibilidade e status |
| 3.1.0 | 2026-06-16 | Integração com Google Agenda via OAuth 2.0 — sincronização automática de eventos confirmados/cancelados |
| 3.2.0 | 2026-07-23 | Migração de deploy: Render → Vercel (funções serverless, `maxDuration` estendido nas rotas de API) |
