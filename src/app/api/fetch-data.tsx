import { Session } from "next-auth";
import { Dispatch, SetStateAction } from "react";
import RequestError from "./error";

interface FetchDataProps<T> {
    getItems: (session: Session) => Promise<T[]>
    setItems: Dispatch<SetStateAction<T[]>>;
    data: Session
    setError: Dispatch<SetStateAction<RequestError | null>>
    setLoading: Dispatch<SetStateAction<boolean>>
}

const FetchData = async <T,>({ getItems, setItems, data, setError, setLoading }: FetchDataProps<T>) => {
    try {
        setLoading(true);
        const items = await getItems(data)
        console.log(items)
        setItems(items);
        setError(null);
    } catch (error) {
        setError(error as RequestError);
    } finally {
        setLoading(false);
    }
};

export default FetchData