import { Session } from "next-auth";
import { Dispatch, SetStateAction } from "react";
import RequestError from "../utils/error";
import { notifyError } from "../utils/notifications";

interface FetchDataProps<T> {
    getItems: (session: Session) => Promise<T[]>
    setItems: Dispatch<SetStateAction<T[]>>;
    data: Session
    setLoading: Dispatch<SetStateAction<boolean>>
}

const FetchData = async <T,>({ getItems, setItems, data, setLoading }: FetchDataProps<T>) => {
    try {
        setLoading(true);
        const items = await getItems(data)
        setItems(items);
    } catch (error: RequestError | any) {
        notifyError(error.message || "Erro ao buscar dados");
    } finally {
        setLoading(false);
    }
};

export default FetchData