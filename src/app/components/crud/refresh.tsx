import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction } from "react";
import { HiOutlineRefresh } from "react-icons/hi";

interface RefreshProps<T> {
    lastUpdate: string;
    setItems: Dispatch<SetStateAction<T[]>>;
    getItems: (session: Session) => Promise<T[]>;
    setLastUpdate: Dispatch<SetStateAction<string>>;
}

const Refresh = <T,>({ lastUpdate, setItems, getItems, setLastUpdate }: RefreshProps<T>) => {
    const { data:session } = useSession();

    const handleRefresh = async () => {
        try {
            if (!session) return;

            const items = await getItems(session);
            setItems(items);
            setLastUpdate(FormatRefreshTime(new Date()));
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex items-center gap-3">
            <button onClick={handleRefresh}><HiOutlineRefresh /></button>
            <label className="text-gray-800">Atualizado em {lastUpdate}</label>
        </div>
    );
}

const FormatRefreshTime = (lastUpdate: Date): string => {
    const hours = lastUpdate.getHours() 
    const minutes = lastUpdate.getMinutes() < 10 ? '0' + lastUpdate.getMinutes() : lastUpdate.getMinutes();
    return hours + ':' +  minutes
}

export default Refresh
export { FormatRefreshTime };
