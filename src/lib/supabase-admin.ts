import { createClient } from '@supabase/supabase-js'

// Service role client for server-side operations that bypass RLS (webhooks, background jobs)
// NEVER expose this client to the browser — server-only
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
