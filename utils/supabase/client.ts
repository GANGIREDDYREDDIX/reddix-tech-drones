import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zldibrhzuxhwecetctxb.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wLCZbYBRYw0Pw0htUUZ01Q_Qc-D8VNX'
  )
}
