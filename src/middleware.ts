import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only_please_change');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect logged in users away from login
    if (pathname === '/admin/login') {
        const sessionCookie = request.cookies.get('admin_session');
        if (sessionCookie) {
            try {
                await jwtVerify(sessionCookie.value, JWT_SECRET);
                return NextResponse.redirect(new URL('/admin', request.url));
            } catch {
                // Invalid token, allow them to stay on login page
            }
        }
        return NextResponse.next();
    }

    // Protect admin routes except login
    if (pathname.startsWith('/admin')) {
        const sessionCookie = request.cookies.get('admin_session');
        
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
            
            // Route protection based on role
            const role = payload.role as string;
            
            // WORKER role cannot access users or services management
            if (role === 'WORKER') {
                if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/services')) {
                     return NextResponse.redirect(new URL('/admin', request.url));
                }
            }
            
            return NextResponse.next();
        } catch (error) {
            console.error('JWT Verification failed:', error);
            // Clear the invalid cookie and redirect to login
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('admin_session');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
