import { Session } from "next-auth"
import RequestError, { translateError } from "../utils/error"

interface RequestApiProps<T> {
    path: string;
    body?: T;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: any;
    isLogin?: boolean
}

interface Response<T> {
    data: T;
}

interface ResponseError {
    message: string;
    status: number;
    path: string;
}

const jsonHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

const AddIdToken = async (session: Session) => {
    if (session.user?.id_token === undefined) {
        throw new Error("id token not found in session");
    }

    return { "id-token": session.user.id_token }
}

const AddAccessToken = async (session: Session) => {
    if (session.user?.id === undefined) {
        throw new Error("access token not found in session");
    }

    return { "access-token": session.user.id }
}

const RequestApi = async <T, TR>({ path, body, method, headers, isLogin }: RequestApiProps<T>): Promise<Response<TR>> => {
    if (!path.startsWith("/")) {
        throw new Error(`path: ${path} must start with /`);
    }

    const fullPath = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

    const response = await fetch(fullPath, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            ...jsonHeaders,
            ...headers,
        },
        signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
        const body = await response.json();
        if (isLogin) {
            throw body.error ? body.error : body;
        }

        const error = body.error as ResponseError;

        error.message = translateError(error.message)

        error.status = response.status;
        error.path = fullPath;
        throw error;
    }

    const parsedBody = (await response.json()) as TR;
    return {...parsedBody} as Response<TR>;
};

const RequestExternalApi = async <T, TR>({ path, body, method, headers }: RequestApiProps<T>): Promise<TR> => {
    const res = await fetch(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: headers,
        signal: AbortSignal.timeout(5000),
        credentials: 'omit'
    });
    
    if (!res.ok && res.status === 500) {
        const body = await res.json();
        const error = new RequestError();
        error.message = body.message || "Erro desconhecido";

        error.message = translateError(error.message)

        error.status = res.status;
        error.path = path;
        throw error;
    }

    const parsedBody = (await res.json()) as TR;
    return {...parsedBody};
};


export default RequestApi
export { AddIdToken, AddAccessToken, RequestExternalApi }