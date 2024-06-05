import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

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
            authorized: ({ req, token }) => {
                // Se tiver um token, a requisição está autorizada
                return !!token;
            }
        }
    }
);

export const config = { matcher: ['/pages/:path*'] };
