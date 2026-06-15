import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const AUTHORIZED_EMAILS = process.env.AUTHORIZED_EMAILS 
    ? process.env.AUTHORIZED_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
    : ['chintureddy6165@gmail.com', 'reddix.lpu@gmail.com', 'yashkansal321@gmail.com', 'iamsiddhartha9@gmail.com'];

  const isAdmin = user?.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase());

  return NextResponse.json({ isAdmin: !!isAdmin });
}
