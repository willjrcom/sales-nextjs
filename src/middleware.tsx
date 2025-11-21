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
            authorized: ({ token }) => !!token,
        }
    }
);

export const config = {
    matcher: [
        '/((?!_next|api/auth|login|login/forget-password|login/sign-up|access/company-selection|favicon.ico).*)',
        '/'  // Permite a URL base
    ]
};
