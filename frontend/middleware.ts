import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';

// Routes that require authentication
const protectedRoutes: string[] = [];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const { pathname } = request.nextUrl;

    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Verify token if it exists
    const user = token ? verifyToken(token) : null;

    // Redirect to login if accessing protected route without valid token
    if (isProtectedRoute && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to home if accessing auth routes with valid token
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Add security headers
    const response = NextResponse.next();

    // CORS headers for API routes (explicit configuration)
    if (pathname.startsWith('/api/')) {
        // Only allow same-origin in production, allow localhost in development
        const allowedOrigin = process.env.NODE_ENV === 'production'
            ? request.headers.get('origin') || ''
            : 'http://localhost:3000';

        response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        console.log('🌐 [CORS] Request to API:', { pathname, origin: request.headers.get('origin') });
    }

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: lh3.googleusercontent.com; connect-src 'self' https://accounts.google.com https://www.googleapis.com; frame-src 'self' https://accounts.google.com;"
    );

    // HTTPS enforcement in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
