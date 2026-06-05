import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const AUTHORIZED_EMAILS = process.env.AUTHORIZED_EMAILS 
    ? process.env.AUTHORIZED_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
    : ['chintureddy6165@gmail.com'];

  const isAdmin = user?.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase());

  return NextResponse.json({ isAdmin: !!isAdmin });
}
