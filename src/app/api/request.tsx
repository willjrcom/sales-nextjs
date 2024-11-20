import { Session } from "next-auth"
import { useSession } from "next-auth/react"

interface RequestApiProps<T> {
    path: string
    body?: T
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    headers?: any
}

interface Response<T> {
    data: T
}

const jsonHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

const AddIdToken = async (session: Session) => {
    if (session.user.idToken === undefined) {
        throw new Error("id token not found in session");
    }

    return { "id-token": session.user.idToken }
}

const AddAccessToken = async (session: Session) => {
    if (session.user.id === undefined) {
        throw new Error("access token not found in session");
    }

    return { "access-token": session.user.id }
}

const RequestApi = async <T,TR>({path, body, method, headers }: RequestApiProps<T>): Promise<Response<TR>> => {
    if (!path.startsWith("/")) {
        throw new Error(`path: ${path} must start with /`);
    }

    const fullPath = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;
    const res = await fetch(fullPath, {
        method: method,
        body: JSON.stringify(body),
        headers: {
            ...jsonHeaders,
            ...headers
        },
    });
    

    if (!res.ok) {
        throw new Error("Failed to " + method + ", path: " + fullPath);
    }

    if (res.status > 299) {
        throw new Error("Server error " + method + ", path: " + fullPath + ", status: " + res.status, { cause: res });
    }

    return await res.json();
};

export default RequestApi
export { AddIdToken, AddAccessToken}