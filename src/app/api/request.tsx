import { Session } from "next-auth"
import RequestError from "./error"

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

const RequestApi = async <T, TR>({ path, body, method, headers }: RequestApiProps<T>): Promise<Response<TR>> => {
    if (!path.startsWith("/")) {
        throw new Error(`path: ${path} must start with /`);
    }

    const fullPath = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

    const res = await fetch(fullPath, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            ...jsonHeaders,
            ...headers,
        },
    });

    if (!res.ok && res.status === 500) {
        const body = await res.json();
        const error = new RequestError();
        error.message = body.message || "Erro desconhecido";

        if (error.message == "sql: no rows in result set") {
            error.message = "Não encontrado";
        }

        error.status = res.status;
        error.path = fullPath;
        throw error;
    }

    const parsedBody = (await res.json()) as TR;
    return {...parsedBody} as Response<TR>;
};

export default RequestApi
export { AddIdToken, AddAccessToken }