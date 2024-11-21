import { Session } from "next-auth";
import { Dispatch, SetStateAction } from "react";

interface FetchDataProps<T> {
    getItems: (session: Session) => Promise<T[]>
    setItems: Dispatch<SetStateAction<T[]>>;
    data: Session
    setError: Dispatch<SetStateAction<string | null>>
    setLoading: Dispatch<SetStateAction<boolean>>
}

const FetchData = async <T,>({ getItems, setItems, data, setError, setLoading }: FetchDataProps<T>) => {
    try {
        setLoading(true);
        const items = await getItems(data)
        setItems(items);
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setLoading(false);
    }
};

export default FetchData