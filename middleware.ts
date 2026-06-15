import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 100; // 100 requests per IP per minute
const WINDOW_MS = 60 * 1000;

export async function middleware(request: NextRequest) {
  try {
    // --- 0. Rate Limiting ---
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    // Cleanup map periodically to prevent memory leaks
    if (rateLimitMap.size > 10000) {
      rateLimitMap.clear();
    } else if (Math.random() < 0.01) { // 1% chance to run cleanup
      for (const [key, data] of rateLimitMap.entries()) {
        if (data.lastReset < windowStart) {
          rateLimitMap.delete(key);
        }
      }
    }

    let rateData = rateLimitMap.get(ip);
    if (!rateData || rateData.lastReset < windowStart) {
      rateData = { count: 0, lastReset: now };
    }
    
    rateData.count++;
    rateLimitMap.set(ip, rateData);

    if (rateData.count > RATE_LIMIT) {
      return new NextResponse('Too Many Requests. Please slow down.', { status: 429 });
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zldibrhzuxhwecetctxb.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wLCZbYBRYw0Pw0htUUZ01Q_Qc-D8VNX';

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const AUTHORIZED_EMAILS = process.env.AUTHORIZED_EMAILS 
      ? process.env.AUTHORIZED_EMAILS.split(',').map(e => e.trim().toLowerCase()) 
      : ['chintureddy6165@gmail.com', 'reddix.lpu@gmail.com', 'yashkansal321@gmail.com', 'iamsiddhartha9@gmail.com'];

    const isAdmin = user?.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase());

    // --- 1. Protect UI Routes (Admin & Customer) ---
    const isCustomerRoute = ['/orders', '/settings', '/complete-profile'].some(prefix => pathname.startsWith(prefix));
    const isAdminRoute = pathname.startsWith('/admin');

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isCustomerRoute && !user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- 2. Protect Admin API Routes ---
    const adminApiPrefixes = [
      '/api/products',
      '/api/discounts',
    ];

    const isAdminOnlyApi = adminApiPrefixes.some(prefix => pathname.startsWith(prefix)) || 
                           (pathname.startsWith('/api/reviews/') && pathname !== '/api/reviews');

    const isModifyingRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);

    if (isAdminOnlyApi && isModifyingRequest) {
      if (!isAdmin) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized. Admin session required.' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
    }

    // --- 3. Prevent Caching on All Protected Routes ---
    // If we are in an authenticated area (admin or user dashboard), make sure the browser doesn't cache the page.
    // This prevents the user from clicking the "Back" button after logout and seeing the protected page from bfcache.
    if (isAdminRoute || isCustomerRoute) {
      supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      supabaseResponse.headers.set('Pragma', 'no-cache');
      supabaseResponse.headers.set('Expires', '0');
      supabaseResponse.headers.set('Surrogate-Control', 'no-store');
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware Invocation Error:", error);
    // Graceful fallback to prevent bricking the site
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
