import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import Login from "../../user/login/login";
import Company from "@/app/entities/company/company";
import { NextAuthOptions } from "next-auth";
import UserBackend from "@/app/entities/user/user";

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
                            user: response.user,
                            email: email,
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
        maxAge: 3 * 60 * 60, // 1 dia de sessão
        strategy: "jwt",
    },
    jwt: {
        maxAge: 3 * 60 * 60, // 1 dia de JWT
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
            }

            return token
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