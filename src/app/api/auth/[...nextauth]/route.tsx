import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import Login from "../login/route";
import Company from "@/app/entities/company/company";
import { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email || "";
                const password = credentials?.password || "";

                const response = await Login({ email, password });
                
                if (response) {
                    return {
                        id: response.access_token,
                        accessToken: response.access_token,
                        companies: response.companies,
                    };
                }

                return null;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        maxAge: 24 * 60 * 60, // Duração da sessão em segundos (padrão é 30 dias)
        strategy: "jwt",
    },
    jwt: {
        maxAge: 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.accessToken;
                token.accessToken = user.accessToken;
                token.companies = user.companies;
            }

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.accessToken = token.accessToken;
                session.companies = token.companies;
            }

            const now = new Date();
            now.setHours(now.getHours() + 3);
            session.expires = now.toISOString();
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
    debug: true,
    cookies: {
        sessionToken: {
            name: "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
declare module "next-auth/jwt" {
    interface JWT {
        idToken: string;
        accessToken?: string;
        companies: Company[]
    }
}

declare module "next-auth" {
    interface Session {
        idToken: string;
        accessToken?: string;
        companies: Company[]
    }

    interface User {
        accessToken?: string;
        companies: Company[]
    }
}