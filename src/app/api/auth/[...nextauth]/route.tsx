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
                const timeout = await setTimeout(() => {}, 3000000000);
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
        async session({ session, user }) {
            if (user) {
                session.accessToken = user.accessToken;
                session.companies = user.companies;
            }

            return session
        },
    },
    pages: {
        signOut: '/login',
        signIn: '/access/company-selection',
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