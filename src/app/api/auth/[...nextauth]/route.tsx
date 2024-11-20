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
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const email = credentials?.email || "";
                    const password = credentials?.password || "";

                    const response = await Login({ email, password });

                    if (response?.access_token && response?.companies) {
                        return {
                            id: response.access_token,
                            companies: response.companies,
                            email: email,
                        };
                    }

                    return null; // Retorna null se as credenciais forem inválidas
                } catch (error) {
                    console.error("Error during login:", error);
                    return null; // Retorna null se ocorrer um erro
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
            if (trigger == "update") {
                return { ...token, ...session.user }
            }
            return { ...token, ...user}
        },
        
        async session({ session, token }) {
            session.user = token as any;
            return session
        },
    },
    pages: {
        signIn: '/login', // Página de login personalizada
    },
    debug: process.env.NODE_ENV === "development",
    cookies: {
        sessionToken: {
            name: "sales-app.session-token",
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
        accessToken?: string;
        companies: Company[];
    }
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            idToken?: string;
            companies: Company[];
        };
    }

    interface User {
        id: string;
        idToken?: string;
        companies: Company[];
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };