import { Session } from "next-auth"
import RequestError, { translateError } from "../utils/error"

export interface GetAllResponse<T> {
    items: T[];
    headers: Headers;
    totalCount?: number;
}
interface RequestApiProps<T> {
    path: string;
    body?: T;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: any;
    isLogin?: boolean;
    isFormData?: boolean;
}

interface Response<T> {
    data: T;
    headers: Headers;
}

const jsonHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

const AddAccessToken = (session: Session) => {
    if (session.user?.access_token === undefined) {
        throw new Error("access token not found in session");
    }

    return { "access-token": session.user.access_token }
}

const RequestApi = async <T, TR>({ path, body, method, headers, isLogin, isFormData }: RequestApiProps<T>): Promise<Response<TR>> => {
    if (!path.startsWith("/")) {
        throw new Error(`path: ${path} must start with /`);
    }

    const fullPath = `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

    let fetchHeaders = { ...headers };
    let fetchBody = undefined;

    if (isFormData && body instanceof FormData) {
        // NÃO definir Content-Type, o browser faz isso automaticamente
        fetchBody = body;
    } else if (body) {
        fetchHeaders = { ...jsonHeaders, ...headers };
        fetchBody = JSON.stringify(body);
    } else {
        fetchHeaders = { ...jsonHeaders, ...headers };
    }

    const response = await fetch(fullPath, {
        method,
        body: fetchBody,
        headers: fetchHeaders,
    });

    if (!response.ok) {
        const body = await response.json();
        if (isLogin) {
            throw body.error ? body.error : body;
        }

        const error = body.error as RequestError;

        if (typeof window !== "undefined") {
            error.message = translateError(error.message)
        } else {
            error.message = error.message;
        }

        error.status = response.status;
        error.path = fullPath;
        throw error;
    }

    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/octet-stream")) {
        // Blob para dados brutos
        const blob = await response.blob();
        return {
            data: blob as unknown as TR,
            headers: response.headers
        } as Response<TR>;
    }

    // caso não seja binário, parseia JSON normalmente
    const parsedBody = await response.json();
    return { data: parsedBody.data, headers: response.headers } as Response<TR>;
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
    return { ...parsedBody };
};


export default RequestApi
export { AddAccessToken, RequestExternalApi }