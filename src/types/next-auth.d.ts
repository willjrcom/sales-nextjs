import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import UserBackend from "@/app/entities/user/user";

// Tipagem básica do usuário retornado pelo backend.
// Mantida aqui para evitar problemas de resolução de módulos em arquivos .d.ts.
// interface UserBackend {
//     id: string;
//     name?: string | null;
//     email?: string | null;
//     [key: string]: any;
// }

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: (DefaultSession["user"] & UserBackend & {
      /**
       * Keeps backward compatibility with previous nested structure.
       * The whole backend payload is duplicated here so legacy code can still access `session.user.user`.
       */
      user?: UserBackend;
      access_token?: string;
      id?: string;
    }) | undefined;
  }

  interface User extends DefaultUser, UserBackend {
    /**
     * Raw backend payload (kept for compatibility with existing usage).
     */
    user?: UserBackend;
    access_token?: string;
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    user?: UserBackend;
    access_token?: string;
    exp?: number;
    error?: string;
  }
}

export { };


