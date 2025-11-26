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
        maxAge: 2 * 60 * 60, // 2 hours (igual ao backend)
        strategy: "jwt",
    },
    jwt: {
        maxAge: 2 * 60 * 60, // 2 hours (igual ao backend)
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Handle session updates (e.g., setting access_token via session.update)
            if (trigger === "update") {
                if (session.user.access_token) {
                    token.access_token = session.user.access_token;
                    // Decodifica o novo access_token para atualizar a expiração
                    const decoded = decodeJwt(session.user.access_token);
                    if (decoded.exp) token.exp = decoded.exp;
                }
                if (session.user.user) {
                    token.user = session.user.user;
                }
                // Retorna direto após update, sem verificar expiração
                return token;
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
                // Retorna direto no login inicial, sem verificar expiração
                return token;
            }
            
            // Se já teve erro ao fazer refresh, força logout
            if (token.error === 'RefreshAccessTokenError') {
                return token;
            }
            
            // If token has sufficient time remaining, return it
            const now = Math.floor(Date.now() / 1000);

            // Renew when less than 30 minutes remain (1800 seconds)
            // Token backend válido por 2h, fazemos refresh 30min antes de expirar
            const refreshBuffer = 30 * 60; // 30 minutos
            if (token.exp && now < (token.exp as number) - refreshBuffer) {
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };