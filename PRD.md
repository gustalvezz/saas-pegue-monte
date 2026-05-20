# PRD — Decora Festa · Dashboard Financeiro

**Produto:** Decora Festa  
**Tipo:** Micro SaaS · Controle Financeiro  
**Proprietária:** Flavia Alves da Silva  
**Banco:** C6Bank · Ag. 1 · Conta 177400862  
**Versão do documento:** 1.0  
**Última atualização:** 2026-05-20  
**Status:** Em produção

---

## 1. Visão geral

Sistema web de controle financeiro para uma **empresa de locação de decorações para festas**.
Permite registrar receitas e despesas, visualizar KPIs e gráficos mensais, e exportar relatórios.
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

---

## 3. Personas

### Flavia (proprietária / único usuário)
- Gerencia a empresa de locação de decorações sozinha
- Usa principalmente o celular para registrar transações no dia a dia
- Precisa saber rapidamente quanto entrou, quanto saiu e qual o saldo do mês
- Quer exportar os dados para entregar à contabilidade

---

## 4. Escopo — v1.0

### 4.1 Funcionalidades incluídas

| Funcionalidade | Descrição |
|---|---|
| **Autenticação** | Login com email/senha via Supabase Auth. Sessão persistente. |
| **KPI Cards** | Total Receitas, Total Despesas, Resultado Líquido, Ticket Médio por locação |
| **Gráfico mensal** | Barras Chart.js: Receitas × Despesas × Resultado, agrupado por mês |
| **Top Clientes** | Ranking dos 5 clientes com maior receita de locação |
| **Despesas por Categoria** | Distribuição percentual das despesas por categoria |
| **Tabela de transações** | Lista paginada com filtro por mês e tipo (receita/despesa) |
| **Adicionar transação** | Modal bottom-sheet com campos: data, tipo, categoria, descrição, valor |
| **Editar transação** | Mesmo modal, pré-populado com dados existentes |
| **Excluir transação** | Confirmação antes de deletar |
| **Exportar CSV** | Exporta as transações filtradas atualmente exibidas |
| **PWA** | Instalável em celular, funciona offline com cache básico |
| **Mobile First** | Tabela vira cards no mobile; todos os controles tocáveis |

### 4.2 Fora do escopo (v1.0)

- Multi-usuário / controle de acesso por empresa
- Relatórios PDF
- Notificações push
- Integração bancária automática (Open Finance)
- Emissão de recibos / notas fiscais
- Controle de estoque de itens de decoração
- Agendamento de locações (calendário)

---

## 5. Requisitos funcionais

### RF01 — Autenticação
- O sistema deve exigir login com email e senha antes de qualquer acesso
- Sessão deve ser mantida entre navegações (cookie Supabase)
- Logout disponível no header do dashboard

### RF02 — Dashboard
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
- Valor deve ser positivo (o sinal ±  é determinado pelo tipo)
- Salvar atualiza KPIs, gráfico e tabela imediatamente

### RF05 — Exportação CSV
- Exporta exatamente as transações visíveis na tabela (respeitando filtros ativos)
- Colunas: Data, Descrição, Categoria, Tipo, Valor (negativo para despesas)
- Nome do arquivo: `decora_festa_financeiro.csv`

### RF06 — PWA
- `manifest.json` com nome, cores e ícones da marca
- Service worker com cache de páginas principais
- Página `/offline` exibida quando sem conexão

---

## 6. Requisitos não-funcionais

| Requisito | Especificação |
|---|---|
| **Mobile First** | Layout projetado para 375px, expandido para desktop |
| **Performance** | First Load JS < 250 KB (atingido: ~225 KB no dashboard) |
| **Segurança** | RLS no Supabase — apenas usuários autenticados acessam dados |
| **Disponibilidade** | Render free tier (pode ter cold start de ~30s) |
| **Tipagem** | TypeScript strict em todo o código |

---

## 7. Modelo de dados

### Tabela `transactions` (Supabase / PostgreSQL)

```sql
id          uuid primary key default gen_random_uuid()
date        date not null
description text not null
type        text not null  -- 'receita' | 'despesa'
category    text not null  -- ver enum abaixo
value       numeric(10,2) not null  -- sempre positivo
created_at  timestamptz not null default now()
```

**Enum `category`:**
- `Locação`
- `Devolução`
- `Compra de Decoração`
- `Fatura Cartão`
- `Outros`

**Políticas RLS:**
- `authenticated` → acesso total (select, insert, update, delete)

---

## 8. Arquitetura

```
Browser (PWA)
    │
    ├── Next.js 14 App Router (Render)
    │   ├── /login        → autenticação
    │   ├── /dashboard    → aplicação principal (client component)
    │   └── /offline      → fallback PWA
    │
    └── Supabase
        ├── Auth (email/senha)
        └── PostgreSQL (tabela transactions)
```

**Fluxo de dados:**
1. Usuário loga → Supabase Auth cria sessão via cookie
2. Dashboard monta → `supabase.auth.getUser()` valida sessão
3. Dados carregados → `supabase.from('transactions').select('*')`
4. CRUD → insert/update/delete via Supabase JS SDK
5. Após cada mutação → refetch para atualizar todos os componentes

---

## 9. Design system

### Cores

| Token | Hex | Uso |
|---|---|---|
| `--teal` | `#4ECDC4` | Primária, receitas, CTA principal |
| `--coral` | `#FF6B6B` | Despesas, erros, alertas |
| `--green-dark` | `#5CB85C` | Resultado positivo, valores de receita |
| `--purple-dark` | `#9B6BC4` | Ticket médio, botão editar |
| `--orange-brand` | `#FFAB76` | Categoria Devolução |
| `--dark` | `#22223B` | Textos principais, header tabela |
| `--mid` | `#66667A` | Textos secundários |
| `--bg` | `#FFF8FC` | Background geral |

### Tipografia
- Família: **Nunito** (Google Fonts)
- Pesos usados: 400, 600, 700, 800, 900

### Componentes principais
- **KPI Card** — border-top colorida, ícone decorativo, valor grande
- **Pill de categoria** — tag colorida por categoria
- **Modal de form** — bottom-sheet no mobile, dialog centralizado no desktop
- **Filtros** — botões pill com estado ativo colorido por contexto

---

## 10. Roadmap

### v1.1 (próxima)
- [ ] Filtro por intervalo de datas (date range picker)
- [ ] Campo de busca na tabela (search por descrição)
- [ ] Indicador de saldo atual da conta bancária (campo editável no header)
- [ ] Confirmação de exclusão mais elegante (toast em vez de `confirm()`)

### v1.2
- [ ] Gráfico de pizza para distribuição de categorias
- [ ] Resumo mensal exportável (PDF simples)
- [ ] Nota / observação por transação (campo opcional)

### v2.0
- [ ] Multi-usuário com isolamento de dados por `user_id`
- [ ] Integração com Pix / Open Finance para importação automática
- [ ] Agendamento de locações com calendário
- [ ] Controle de clientes (cadastro, histórico por cliente)

---

## 11. Histórico de versões do PRD

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 2026-05-20 | Documento inicial — v1.0 do produto |
