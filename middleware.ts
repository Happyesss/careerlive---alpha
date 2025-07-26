import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth';

const protectedRoutes = [
  '/',
  '/upcoming',
  '/meeting',
  '/previous',
  '/recordings',
  '/personal-room',
];

const authRoutes = ['/sign-in', '/sign-up'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internal routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;
  
  let isAuthenticated = false;
  if (token) {
    try {
      const decoded = await verifyTokenEdge(token);
      isAuthenticated = !!decoded;
    } catch (error) {
      isAuthenticated = false;
    }
  }

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
