import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import Login from "../login/route";
import Company from "@/app/entities/company/company";

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
                console.log(response)
                if (response) {
                    return {
                        id: "2",
                        accessToken: response.access_token,
                        companies: response.companies,
                    };
                }

                return null;
            }
        })
    ],
    //secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
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

            return session
        },
    },
    pages: {
        signIn: '/login',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

declare module "next-auth/jwt" {
    interface JWT {
        idToken?: string;
        accessToken?: string;
        companies: Company[]
    }
}

declare module "next-auth" {
    interface Session {
        idToken?: string;
        accessToken?: string;
        companies: Company[]
    }

    interface User {
        accessToken?: string;
        companies: Company[]
    }
}