# CLAUDE.md — Instruções permanentes para o projeto Decora Festa

Este arquivo é lido automaticamente pelo Claude Code em toda sessão.
As regras abaixo devem ser seguidas **sempre**, em todas as implementações.

---

## Regra obrigatória: atualizar README.md e PRD.md a cada mudança

**Toda vez que qualquer implementação for feita neste projeto — sem exceção — você DEVE:**

1. **Atualizar `README.md`**
   - Se uma nova funcionalidade foi adicionada → adicionar na seção "Funcionalidades"
   - Se um novo componente ou arquivo foi criado → atualizar a seção "Estrutura do projeto"
   - Se um novo script foi adicionado → atualizar a seção "Scripts"
   - Se a stack mudou (nova lib, nova dependência importante) → atualizar a tabela "Stack"
   - Sempre atualizar a linha da versão na tabela "Histórico de versões" com a data e descrição da mudança

2. **Atualizar `PRD.md`**
   - Se uma funcionalidade do roadmap foi implementada → mover do roadmap para a seção "4.1 Funcionalidades incluídas" e marcar como `[x]` no roadmap
   - Se uma nova funcionalidade foi adicionada que não estava no roadmap → adicionar em "4.1" e ao roadmap como concluída
   - Se o modelo de dados mudou (nova tabela, nova coluna) → atualizar seção "7. Modelo de dados"
   - Se a arquitetura mudou → atualizar seção "8. Arquitetura"
   - Se novos requisitos funcionais surgiram → adicionar em "5. Requisitos funcionais"
   - Sempre atualizar a tabela "11. Histórico de versões do PRD" com versão, data e descrição

**Estes arquivos são a documentação viva do produto. Nunca entregue uma implementação sem atualizá-los.**

---

## Projeto

**Nome:** Decora Festa  
**Tipo:** Micro SaaS — Controle Financeiro de Locação de Decorações para Festas  
**Proprietária:** Flavia Alves da Silva  
**Branch de desenvolvimento:** `claude/decora-festa-saas-S5oHz`

---

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Estilo:** Tailwind CSS + CSS Variables inline (não usar classes Tailwind para cores de marca)
- **Gráficos:** Chart.js + react-chartjs-2
- **Backend/Auth:** Supabase (PostgreSQL + Auth via `@supabase/ssr`)
- **Deploy:** Render (`output: standalone` no next.config.js)
- **PWA:** manifest.json + service worker em `/public/sw.js`

---

## Convenções de código

### Cores — SEMPRE usar CSS variables, nunca hardcode
```tsx
// CORRETO
style={{ color: 'var(--teal)' }}
style={{ background: 'var(--coral-l)' }}

// ERRADO
style={{ color: '#4ECDC4' }}
className="text-[#4ECDC4]"
```

### Variáveis de cor disponíveis
```
--teal, --teal-d, --teal-l
--coral, --coral-l
--green-dark, --green-l, --green-brand
--purple-dark, --purple-l, --purple-brand
--orange-brand, --orange-l
--dark, --mid, --light, --border, --bg
```

### Componentes
- Todos os componentes de UI ficam em `src/components/`
- Toda lógica pura (formatação, cálculos) fica em `src/lib/utils.ts`
- Tipos TypeScript ficam em `src/lib/types.ts`
- Páginas são simples — delegam lógica para componentes e utils

### Mobile First — obrigatório
- Sempre projetar para 375px primeiro
- Breakpoints: `sm:` para 640px+, `lg:` para 1024px+
- Tabelas viram cards no mobile (padrão já estabelecido no `TransactionTable.tsx`)
- Modais são bottom-sheet no mobile (`items-end` no container, `rounded-t-3xl`)

### Supabase
- Operações de leitura/escrita: sempre via `createClient()` do `src/lib/supabase-client.ts`
- Páginas server-side: usar `createServerSupabase()` do `src/lib/supabase-server.ts`
- Novas tabelas: criar migration em `supabase/migrations/` com prefixo numérico sequencial
- Sempre habilitar RLS em novas tabelas

---

## Estrutura de arquivos atual

```
src/app/page.tsx                  → redirect root
src/app/layout.tsx                → PWA + SW register
src/app/globals.css               → CSS variables + Tailwind base
src/app/login/page.tsx            → login email/senha
src/app/dashboard/page.tsx        → dashboard principal
src/app/offline/page.tsx          → fallback offline
src/components/KPICards.tsx       → 4 KPI cards
src/components/MonthlyChart.tsx   → gráfico Chart.js
src/components/SideStats.tsx      → top clientes + categorias
src/components/TransactionForm.tsx → modal add/edit
src/components/TransactionTable.tsx → tabela + mobile cards
src/lib/types.ts                  → interfaces TS
src/lib/utils.ts                  → helpers (formatBRL, KPIs, CSV…)
src/lib/supabase-client.ts        → Supabase browser client
src/lib/supabase-server.ts        → Supabase server client (SSR)
supabase/migrations/001_create_transactions.sql
supabase/seed.sql                 → dados históricos Mar–Mai 2026
public/manifest.json              → PWA manifest
public/sw.js                      → service worker
render.yaml                       → config Render
```

---

## Categorias de transação (enum fixo)

```
'Locação' | 'Devolução' | 'Compra de Decoração' | 'Fatura Cartão' | 'Outros'
```

---

## Checklist antes de cada commit

- [ ] `npm run build` passa sem erros
- [ ] Componentes novos são mobile-first
- [ ] Novas tabelas Supabase têm RLS habilitado
- [ ] `README.md` atualizado
- [ ] `PRD.md` atualizado
- [ ] Migration SQL criada (se houve mudança de schema)
