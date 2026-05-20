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
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Deploy | Render (Node server — `output: standalone`) |
| PWA | Web App Manifest + Service Worker |

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

### Categorias

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
```

### 3. Banco de dados

No SQL Editor do Supabase, execute em ordem:

```sql
-- 1. Cria tabela + RLS
supabase/migrations/001_create_transactions.sql

-- 2. Popula com dados históricos Mar–Mai 2026 (opcional)
supabase/seed.sql
```

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
2. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. O Render detecta o `render.yaml` e executa:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`

---

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx              # redirect → /login ou /dashboard
│   ├── layout.tsx            # meta PWA + service worker
│   ├── globals.css           # CSS variables + Tailwind base
│   ├── login/page.tsx        # tela de login
│   ├── dashboard/page.tsx    # dashboard principal
│   └── offline/page.tsx      # fallback PWA offline
├── components/
│   ├── KPICards.tsx          # 4 cards de KPI
│   ├── MonthlyChart.tsx      # gráfico Chart.js
│   ├── SideStats.tsx         # top clientes + categorias
│   ├── TransactionForm.tsx   # modal add/edit
│   └── TransactionTable.tsx  # tabela + mobile cards
└── lib/
    ├── types.ts              # interfaces TypeScript
    ├── utils.ts              # formatBRL, KPIs, CSV, etc.
    ├── supabase-client.ts    # cliente browser (SSR)
    └── supabase-server.ts    # cliente server (SSR)
supabase/
├── migrations/
│   └── 001_create_transactions.sql
└── seed.sql
public/
├── manifest.json             # PWA manifest
├── sw.js                     # service worker
└── icons/
    ├── icon-192.svg
    └── icon-512.svg
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
