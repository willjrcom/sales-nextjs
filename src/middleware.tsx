import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;

        if (!token) {
            // Redireciona para a página de login se não estiver autenticado
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Se houver erro no refresh do token, força logout
        if (token.error === 'RefreshAccessTokenError') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Não autoriza se não tiver token ou se houver erro de refresh
                return !!token && token.error !== 'RefreshAccessTokenError';
            },
        }
    }
);

export const config = {
    matcher: [
        // Ignora arquivos estáticos (qualquer coisa com .ext)
        '/((?!_next|api/auth|login|login/forget-password|login/sign-up|access/company-selection|favicon.ico|.*\\.[a-zA-Z0-9]+).*)',
        '/',
    ],
};
