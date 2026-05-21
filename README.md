# 🎈 Decora Festa · Dashboard Financeiro

Micro SaaS para controle financeiro de empresa de **locação de decorações para festas**.
Gerencia receitas, despesas, categorias e exibe KPIs e gráficos mensais.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS + CSS Variables |
| Gráficos | Chart.js + react-chartjs-2 |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Render (Node server — `output: standalone`) |
| PWA | Web App Manifest + Service Worker |
| WhatsApp API | Evolution API (auto-hospedado no Render) |
| IA Chatbot | Anthropic Claude Haiku (`@anthropic-ai/sdk`) |

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

### Catálogo de decorações

- **Gestão de fotos** — upload para Supabase Storage com categorização e tags
- **Bot envia fotos** relevantes do catálogo durante a conversa com o lead
- **Toggle ativo/inativo** — controle de quais fotos o bot pode enviar

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

RLS habilitado — usuários autenticados têm acesso total às suas transações.

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

# Chatbot WhatsApp (opcional — necessário para o módulo Atendimento)
EVOLUTION_API_URL=https://evolution.seuapp.onrender.com
EVOLUTION_API_KEY=sua_chave_api
EVOLUTION_INSTANCE_NAME=decora-festa
EVOLUTION_WEBHOOK_SECRET=token_secreto_qualquer
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Banco de dados

No SQL Editor do Supabase, execute em ordem:

```sql
-- 1. Tabela de transações financeiras
supabase/migrations/001_create_transactions.sql

-- 2. Tabelas de leads e conversas (módulo Atendimento)
supabase/migrations/002_leads_conversations.sql

-- 3. Tabela de catálogo de decorações
supabase/migrations/003_catalog.sql

-- 4. Dados históricos Mar–Mai 2026 (opcional)
supabase/seed.sql
```

Crie também o bucket `catalog` no Supabase Storage com acesso público (para as fotos do catálogo).

### 4. Criar usuário

No painel Supabase → **Authentication → Users → Add user**.

### 5. Rodar localmente

```bash
npm run dev
# http://localhost:3000
```

---

## Deploy no Render

O arquivo `render.yaml` já configura tudo automaticamente.

1. Conecte o repositório no [Render](https://render.com)
2. Adicione as variáveis de ambiente (todas marcadas `sync: false` no render.yaml):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`, `EVOLUTION_WEBHOOK_SECRET`
   - `ANTHROPIC_API_KEY`
3. O Render detecta o `render.yaml` e executa:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`

### Evolution API no Render

Deploy separado como serviço Docker:
- **Image:** `atendai/evolution-api:latest`
- Após deploy, criar instância e escanear QR code com o WhatsApp da Flávia
- Configurar webhook para `https://seu-saas.onrender.com/api/webhook/whatsapp?secret=EVOLUTION_WEBHOOK_SECRET`

---

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                          # redirect → /login ou /dashboard
│   ├── layout.tsx                        # meta PWA + service worker
│   ├── globals.css                       # CSS variables + Tailwind base
│   ├── login/page.tsx                    # tela de login
│   ├── dashboard/page.tsx               # dashboard financeiro principal
│   ├── dashboard/atendimento/page.tsx   # lista de leads WhatsApp
│   ├── dashboard/atendimento/[leadId]/  # conversa + dados do lead
│   ├── dashboard/catalogo/page.tsx      # gestão do catálogo de fotos
│   ├── api/webhook/whatsapp/route.ts    # webhook Evolution API
│   └── offline/page.tsx                  # fallback PWA offline
├── components/
│   ├── KPICards.tsx          # 4 cards de KPI financeiro
│   ├── MonthlyChart.tsx      # gráfico Chart.js
│   ├── SideStats.tsx         # top clientes + categorias
│   ├── TransactionForm.tsx   # modal add/edit transação
│   ├── TransactionTable.tsx  # tabela + mobile cards
│   ├── LeadCard.tsx          # card de lead com status badge
│   ├── ChatBubble.tsx        # bolha de mensagem WhatsApp
│   └── CatalogUpload.tsx     # upload de foto do catálogo
└── lib/
    ├── types.ts              # interfaces TypeScript
    ├── utils.ts              # formatBRL, KPIs, CSV, etc.
    ├── supabase-client.ts    # cliente browser
    ├── supabase-server.ts    # cliente server (SSR com cookies)
    ├── supabase-admin.ts     # cliente admin (service role, webhook)
    ├── evolution-api.ts      # wrapper Evolution API (WhatsApp)
    ├── chatbot.ts            # Claude Haiku — geração de respostas
    └── catalog.ts            # busca de itens do catálogo
supabase/
├── migrations/
│   ├── 001_create_transactions.sql
│   ├── 002_leads_conversations.sql
│   └── 003_catalog.sql
└── seed.sql
public/
├── manifest.json             # PWA manifest
├── sw.js                     # service worker
└── icons/
render.yaml                   # deploy Render
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
