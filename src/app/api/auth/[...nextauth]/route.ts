import NextAuth, { Session } from "next-auth";
import { Buffer } from 'buffer';
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import Login from "../../user/login/login";
import { NextAuthOptions } from "next-auth";
import UserBackend from "@/app/entities/user/user";
import RefreshAccessToken from '@/app/api/user/refresh-access-token/user';

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

async function refreshAccessToken(token: any) {
    try {
        // Construct a fake session to reuse RefreshAccessToken helper
        const session = { user: { access_token: token.access_token } } as Session;
        const newToken = await RefreshAccessToken(session);
        const decoded = decodeJwt(newToken);
        return {
            ...token,
            access_token: newToken,
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
                remember: { label: "Lembrar conexão", type: "boolean" },
            },
            async authorize(credentials) {
                const email = credentials?.email || "";
                const password = credentials?.password || "";
                try {

                    const response = await Login({ email, password });

                    if (response?.id_token) {
                        return {
                            id: response.id_token,
                            name: response.user.name || email,
                            user: response.user,
                            email,
                        };
                    }

                    throw new Error("Credenciais inválidas");
                } catch (error) {
                    console.error("Erro na autenticação:", error);

                    // Extrai mensagem de erro mais amigável para o usuário
                    let errorMessage = "Erro desconhecido";

                    if (error && typeof error === 'object' && 'message' in error) {
                        const message = (error as { message?: string }).message || '';

                        // Verifica se é erro de coluna inexistente no banco
                        if (message.includes('column u.image_path does not exist')) {
                            errorMessage = "Erro no banco de dados: campo de imagem não encontrado. Entre em contato com o suporte.";
                        } else if (message.includes('SQLSTATE')) {
                            errorMessage = "Erro no banco de dados. Entre em contato com o suporte.";
                        } else {
                            errorMessage = message;
                        }
                    }

                    throw new Error(errorMessage);
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        maxAge: 60 * 60, // 1 hour
        strategy: "jwt",
    },
    jwt: {
        maxAge: 60 * 60, // 1 hour
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Handle session updates (e.g., setting access_token via session.update)
            if (trigger === "update") {
                if (session.user.access_token) {
                    token.access_token = session.user.access_token;
                }
                if (session.user.user) {
                    token.user = session.user.user;
                }
            }

            // Initial sign in: store the access token (access_token) on the token object
            if (user) {
                token.email = user.email;
                token.sub = user.id;
                token.access_token = user.id;
                token.user = user.user;
                // decode expiration from the access_token
                const decoded = decodeJwt(token.access_token as string);
                if (decoded.exp) token.exp = decoded.exp;
            }
            // If token has sufficient time remaining, return it
            const now = Math.floor(Date.now() / 1000);

            // Renew when less than 10 minutes (600 seconds) remain
            const totalTimeLeft = 60 * 30;
            if (token.exp && now < (token.exp as number) - totalTimeLeft) {
                return token;
            }

            // Token expired or about to expire, refresh it
            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            // Transfere o access_token e outras informações do token para a sessão
            session.user = session.user || {};
            if (token.sub) session.user.id = token.sub;
            if (token.access_token) session.user.access_token = token.access_token;
            if (token.user) session.user.user = token.user;

            return session
        },
    },
    pages: {
        signIn: '/login',
        newUser: '/login/sign-up',
    },
    debug: process.env.NODE_ENV === "development",
};

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        user: UserBackend;
        access_token?: string;
        exp?: number;
        error?: string;
    }
}

declare module "next-auth" {
    interface Session {
        user: User
    }

    interface User {
        user: UserBackend;
        access_token?: string;
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };