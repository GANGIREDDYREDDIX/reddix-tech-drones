import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // If the user is trying to access any /admin page EXCEPT /admin/login
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    const hasSession = request.cookies.get('admin_session');

    if (!hasSession) {
      // Redirect to login page if no session cookie exists
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is logged in and tries to go to login page, redirect to dashboard
  if (request.nextUrl.pathname === '/admin/login') {
    const hasSession = request.cookies.get('admin_session');
    if (hasSession) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

// Only run middleware on /admin routes
export const config = {
  matcher: '/admin/:path*',
};
