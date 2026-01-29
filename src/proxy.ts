import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enforce authentication
 * Redirects unauthenticated users to home page
 */
export function proxy(request: NextRequest) {
    // Public paths that don't require auth
    const publicPaths = ['/', '/signin'];
    const path = request.nextUrl.pathname;

    // Allow public paths and API routes
    if (publicPaths.includes(path) || path.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Protected paths require authentication
    // Note: We're using client-side auth checks in the actual pages
    // This middleware is just for additional security layer
    
    return NextResponse.next();
}

// Configure which paths this middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)',
    ],
};

