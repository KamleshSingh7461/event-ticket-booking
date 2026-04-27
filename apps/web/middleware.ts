import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Role-based access control
        if (path.startsWith('/admin') && token?.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        if (path.startsWith('/venue-manager') && token?.role !== 'VENUE_MANAGER') {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        if (path.startsWith('/coordinator') && token?.role !== 'COORDINATOR') {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        if (path.startsWith('/user') && token?.role !== 'USER') {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Verify page protection - accessible by Admin, Manager, Coordinator
        if (path.startsWith('/verify')) {
            const allowedRoles = ['SUPER_ADMIN', 'VENUE_MANAGER', 'COORDINATOR'];
            if (!token?.role || !allowedRoles.includes(token.role as string)) {
                return NextResponse.redirect(new URL('/login', req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        '/admin/:path*',
        '/venue-manager/:path*',
        '/coordinator/:path*',
        '/user/:path*',
        '/verify/:path*',
        '/api/admin/:path*'
    ],
};
