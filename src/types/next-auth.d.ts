import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

// Tipagem básica do usuário retornado pelo backend.
// Mantida aqui para evitar problemas de resolução de módulos em arquivos .d.ts.
interface UserBackend {
    id: string;
    name?: string | null;
    email?: string | null;
    [key: string]: any;
}

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


