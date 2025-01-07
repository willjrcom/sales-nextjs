import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import Login from "../login/route";
import Company from "@/app/entities/company/company";
import { NextAuthOptions } from "next-auth";
import UserBackend from "@/app/entities/user/user";

const authOptions: NextAuthOptions = {
    providers: [
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
                            companies: response.user.companies,
                            email: email,
                        };
                    }

                    return null
                } catch (error) {
                    return null
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
            if (trigger === "update" && session.user.idToken) {
                token.idToken = session.user.idToken;
                token.currentCompany = session.user.currentCompany;
            } else if (trigger === "update" && session.user.user) {
                token.user = session.user.user;
            }

            if (user) {
                token.email = user.email;
                token.sub = user.id;
                token.user = user.user;
                token.companies = user.companies;
            }

            return token
        },
        
        async session({ session, token }) {
            // Transfere o idToken e outras informações do token para a sessão
            session.user = session.user || {};
            if (token.sub) session.user.id = token.sub;
            if (token.idToken) session.user.idToken = token.idToken;
            if (token.user) session.user.user = token.user;
            if (token.companies) session.user.companies = token.companies;
            if (token.currentCompany) session.user.currentCompany = token.currentCompany;
        
            return session
        },
    },
    pages: {
        signIn: '/login', // Página de login personalizada
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
        idToken?: string;
        companies: Company[];
        currentCompany?: Company;
    }
}

declare module "next-auth" {
    interface Session {
        user: User
    }

    interface User {
        user: UserBackend;
        idToken?: string;
        companies: Company[];
        currentCompany?: Company;
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };