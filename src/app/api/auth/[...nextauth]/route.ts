import NextAuth from "next-auth";
import CredentialsProvider from "./credencial-provider";
import { NextAuthOptions } from "next-auth";
import jwt from "./jwt";
import session from "./session";

const authOptions: NextAuthOptions = {
    providers: [CredentialsProvider],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        maxAge: 60 * 60, // 1 hour (igual ao backend)
        strategy: "jwt",
    },
    jwt: {
        maxAge: 60 * 60, // 1 hour (igual ao backend)
    },
    callbacks: {
        jwt: jwt,
        session: session,
    },
    pages: {
        signIn: '/login',
        newUser: '/login/sign-up',
    },
    debug: process.env.NODE_ENV === "development",
};

// Type declarations moved to src/types/next-auth.d.ts

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };