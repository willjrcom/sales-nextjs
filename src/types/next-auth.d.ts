import "next-auth";
import "next-auth/jwt";
import UserBackend from "@/app/entities/user/user";

// declare module "next-auth/jwt" {
//     interface JWT {
//         id: string;
//         user: UserBackend;
//         access_token?: string;
//         exp?: number;
//         error?: string;
//     }
// }

// declare module "next-auth" {
//     interface Session {
//         authenticatedUser: UserBackend
//         access_token?: string;
//     }
// }
