import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// List of paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/analytics',
  '/goals',
  '/nutrition',
  '/reports'
];

// List of paths that should redirect to dashboard if already authenticated
const authPaths = ['/login', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Debug log
  console.log(`Middleware processing path: ${pathname}, token exists: ${!!token}`);
  
  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname === path);
  
  // If it's the home page and user is authenticated, redirect to dashboard
  if (pathname === '/' && token) {
    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      // Redirect to dashboard if token is valid
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // If token verification fails, continue to home page
      return NextResponse.next();
    }
  }
  
  // If it's an auth path and user is authenticated, redirect to dashboard
  if (isAuthPath && token) {
    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      // Redirect to dashboard if token is valid
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // If token verification fails, clear the invalid token
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }
  
  // If it's a protected path and user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    console.log(`Protected path ${pathname} accessed without token, redirecting to login`);
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // If it's a protected path and user has a token, verify it
  if (isProtectedPath && token) {
    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      // Token is valid, allow access to protected route
      return NextResponse.next();
    } catch (error) {
      // Token verification failed, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      
      const response = NextResponse.redirect(url);
      response.cookies.delete('token');
      return response;
    }
  }
  
  // For all other cases, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
