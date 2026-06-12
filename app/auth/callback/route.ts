import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      // Check if they are a completely new customer (no customer profile yet)
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', session.user.email)
        .single()

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      const baseUrl = isLocalEnv ? origin : (forwardedHost ? `https://${forwardedHost}` : origin);

      if (!customer) {
        // New user! Redirect to onboarding page to complete signup (e.g. referral code)
        return NextResponse.redirect(`${baseUrl}/complete-profile?next=${next}`)
      }

      // Existing user, proceed with login
      const response = NextResponse.redirect(`${baseUrl}${next}`)
      
      // Ensure cookie is set
      const customerName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
      response.cookies.set('customer_name', customerName, { maxAge: 2592000, path: '/' })
      
      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
