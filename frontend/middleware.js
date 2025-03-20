import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Paths that don't require authentication
  const publicPaths = ['/', '/loginRegister'];
  if (publicPaths.includes(req.nextUrl.pathname)) {
    return res;
  }

  // Check auth status
  if (!session) {
    return NextResponse.redirect(new URL('/loginRegister', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/loginRegister',
    '/dashboard/:path*',
    '/agentDashboard/:path*',
  ],
};