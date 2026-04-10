import { createClient } from '@supabase/supabase-js'

// Server-side only — uses the service role key which bypasses RLS.
// Never import this file in Client Components or expose it to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
