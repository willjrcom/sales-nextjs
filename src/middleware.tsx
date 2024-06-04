import { NextAuthMiddlewareOptions, NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const middleware = (request: NextRequestWithAuth) => {
    console.log('Token:', request.nextauth.token);
    const isPrivate = request.nextUrl.pathname.startsWith('/pages');
    console.log('Is private:', isPrivate);
    const isLoggedIn = !!request.nextauth.token;

    if (isPrivate && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
};

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;

        if (!token) {
            // Redireciona para a página de login se não estiver autenticado
            return NextResponse.redirect(new URL('/login', req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Se tiver um token, a requisição está autorizada
                return !!token;
            }
        }
    }
);

export const config = { matcher: ['/pages/:path*'] };
