# PRD — Decora Festa · Dashboard Financeiro

**Produto:** Decora Festa  
**Tipo:** Micro SaaS · Controle Financeiro  
**Proprietária:** Flavia Alves da Silva  
**Banco:** C6Bank · Ag. 1 · Conta 177400862  
**Versão do documento:** 2.0  
**Última atualização:** 2026-05-21  
**Status:** Em desenvolvimento (v2.0)

---

## 1. Visão geral

Sistema web para uma **empresa de locação de decorações para festas**. Módulos:
1. **Financeiro** — registrar receitas e despesas, visualizar KPIs e gráficos mensais, exportar relatórios
2. **Atendimento** — chatbot WhatsApp que qualifica leads automaticamente via IA (Evolution API + Claude Haiku)
3. **Catálogo** — gestão de fotos de decorações enviadas pelo bot para leads durante o atendimento

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

### 4.2 Funcionalidades v2.0 — Módulo Atendimento

| Funcionalidade | Descrição |
|---|---|
| **Chatbot WhatsApp** | Evolution API recebe mensagens. Claude Haiku gera respostas e coleta dados do lead |
| **Coleta de dados** | Bot coleta: nome, tipo de festa, data, convidados, local, tema e orçamento |
| **Takeover automático** | Quando Flávia responde pelo celular (`fromMe: true`), bot é desativado para aquele lead |
| **Dashboard de leads** | Lista com filtro por status, KPIs: novos hoje / em atendimento / qualificados no mês |
| **Histórico de conversa** | Visualização estilo WhatsApp com painel de dados coletados pelo bot |
| **Controle de status** | novo → em_atendimento → qualificado → fechado / perdido |
| **Catálogo de fotos** | Upload de fotos para Supabase Storage, com categoria e tags |
| **Bot envia fotos** | Bot envia até 2 fotos relevantes do catálogo quando tem tipo + tema do evento |

### 4.3 Fora do escopo (v2.0)

- Multi-usuário / controle de acesso por empresa
- Relatórios PDF
- Notificações push
- Integração bancária automática (Open Finance)
- Emissão de recibos / notas fiscais
- Controle de estoque de itens de decoração
- Agendamento de locações (calendário)
- Mockups personalizados de decoração por IA
- Fechamento de lead criando transação automaticamente no financeiro

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

### Tabela `catalog_items`

```sql
id          uuid primary key
name        text not null
description text
category    text  -- aniversário | casamento | chá_bebê | debutante | outros
tags        text[]
image_url   text not null
active      bool default true
created_at  timestamptz
```

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
    │   ├── /login                       → autenticação
    │   ├── /dashboard                   → financeiro (client component)
    │   ├── /dashboard/atendimento       → lista de leads
    │   ├── /dashboard/atendimento/[id]  → conversa + dados do lead
    │   ├── /dashboard/catalogo          → gestão de fotos
    │   ├── /api/webhook/whatsapp        → webhook Evolution API (POST)
    │   └── /offline                     → fallback PWA
    │
    ├── Supabase
    │   ├── Auth (email/senha)
    │   ├── PostgreSQL (transactions, leads, conversations, catalog_items)
    │   └── Storage (bucket "catalog" — fotos públicas)
    │
    └── Evolution API (serviço Docker no Render)
        └── WhatsApp Web → webhook → /api/webhook/whatsapp
```

**Fluxo do chatbot:**
1. Lead envia mensagem no WhatsApp da Flávia
2. Evolution API dispara POST no webhook `/api/webhook/whatsapp?secret=...`
3. Webhook salva mensagem, busca histórico, chama Claude Haiku
4. Claude retorna resposta + dados estruturados do lead (em JSON)
5. Webhook salva resposta, atualiza lead, envia texto via Evolution API
6. Se `suggestCatalog=true`, busca fotos relevantes e envia também
7. Se Flávia responde pelo celular → `fromMe=true` → `bot_active=false` → Flávia assume

**Fluxo financeiro:**
1. Flávia loga → Supabase Auth valida sessão
2. Dashboard carrega → `supabase.from('transactions').select('*')`
3. CRUD → insert/update/delete via Supabase JS SDK
4. Após mutação → refetch imediato

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

### v2.1 (próxima)
- [ ] Fechamento de lead → gerar transação de Locação automaticamente no financeiro
- [ ] Relatório de conversão: leads recebidos → qualificados → fechados
- [ ] Notificação no dashboard quando novo lead qualificado (badge no header)

### v1.1
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
| 1.0 | 2026-05-20 | Documento inicial — v1.0 do produto (módulo financeiro) |
| 2.0 | 2026-05-21 | Módulo Atendimento — chatbot WhatsApp (Evolution API + Claude Haiku), catálogo de fotos, novas tabelas leads/conversations/catalog_items |
