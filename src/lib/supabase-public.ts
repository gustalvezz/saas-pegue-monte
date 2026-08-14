import { createClient } from '@supabase/supabase-js'

/** Client para páginas públicas da loja — sem acesso a cookies/sessão, ao
 * contrário de `supabase-server.ts` (usado pelo painel autenticado). Usar
 * `cookies()` numa página com `generateStaticParams` quebra a pré-renderização
 * estática ("Page changed from static to dynamic at runtime"), então as
 * páginas públicas não podem depender do client SSR baseado em cookies. */
export function createPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
