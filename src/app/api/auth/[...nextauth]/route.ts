import NextAuth from "next-auth";
import { Buffer } from 'buffer';
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import Login from "../../user/login/login";
import Company from "@/app/entities/company/company";
import { NextAuthOptions } from "next-auth";
import UserBackend from "@/app/entities/user/user";

/**
 * Helper to decode a JWT and return its payload
 */
function decodeJwt(jwt: string) {
    try {
        const payload = jwt.split('.')[1];
        const decoded = Buffer.from(payload, 'base64').toString();
        return JSON.parse(decoded);
    } catch {
        return {};
    }
}

/**
 * Refreshes the access token (id_token) using backend endpoint
 */
import RefreshAccessToken from '@/app/api/user/refresh-access-token/user';

async function refreshAccessToken(token: any) {
    try {
        // Construct a fake session to reuse RefreshAccessToken helper
        const session = { user: { id_token: token.id_token } } as unknown as import('next-auth').Session;
        const newToken = await RefreshAccessToken(session);
        const decoded = decodeJwt(newToken);
        return {
            ...token,
            id_token: newToken,
            exp: decoded.exp,
        };
    } catch (error) {
        console.error('Error refreshing access token', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email || "";
                const password = credentials?.password || "";
                try {

                    const response = await Login({ email, password });

                    if (response?.access_token) {
                        return {
                            id: response.access_token,
                            name: response.user.name || email,
                            user: response.user,
                            email,
                        };
                    }

                    throw new Error("Credenciais inválidas");
                } catch (error) {
                    console.error("Erro na autenticação:", error);
                    throw new Error((error as { message?: string }).message || "Erro desconhecido");
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        maxAge: 24 * 60 * 60, // 1 dia de sessão
        strategy: "jwt",
    },
    jwt: {
        maxAge: 24 * 60 * 60, // 1 dia de JWT
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session.user.id_token) {
                token.id_token = session.user.id_token;
                token.currentCompany = session.user.currentCompany;
            } else if (trigger === "update" && session.user.user) {
                token.user = session.user.user;
            }

            if (user) {
                token.email = user.email;
                token.sub = user.id;
                token.user = user.user;
                // decode expiration
                const decoded = decodeJwt(token.id_token as string);
                if (decoded.exp) token.exp = decoded.exp;
            }
            // If token has sufficient time remaining, return it
            const now = Math.floor(Date.now() / 1000);
            console.log(token.exp, now)
            // Renew when less than 10 minutes (600 seconds) remain
            if (token.exp && now < (token.exp as number) - 600) {
                return token;
            }
            
            // Token expired or about to expire, refresh it
            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            // Transfere o id_token e outras informações do token para a sessão
            session.user = session.user || {};
            if (token.sub) session.user.id = token.sub;
            if (token.id_token) session.user.id_token = token.id_token;
            if (token.user) session.user.user = token.user;
            if (token.currentCompany) session.user.currentCompany = token.currentCompany;
        
            return session
        },
    },
    pages: {
        signIn: '/login',
        newUser: '/login/sign-up',
    },
    debug: process.env.NODE_ENV === "development",
    cookies: {
        sessionToken: {
            name: "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
};

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        user: UserBackend;
        id_token?: string;
        exp?: number;
        error?: string;
        currentCompany?: Company;
    }
}

declare module "next-auth" {
    interface Session {
        user: User
    }

    interface User {
        user: UserBackend;
        id_token?: string;
        currentCompany?: Company;
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };