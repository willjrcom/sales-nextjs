import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import type UserBackend from "../app/entities/user/user";

declare module "next-auth" {
    interface Session {
        user: DefaultSession["user"] & {
            user: UserBackend;
            access_token?: string;
            id?: string;
        };
    }

    interface User {
        user: UserBackend;
        access_token?: string;
        id?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        user: UserBackend;
        access_token?: string;
        exp?: number;
        error?: string;
    }
}

export { };


