import { Dispatch, SetStateAction } from "react";
import { HiOutlineRefresh } from "react-icons/hi";

interface RefreshProps<T> {
    lastUpdate: Date;
    setItems: Dispatch<SetStateAction<T[]>>;
    getItems: () => Promise<T[]>;
    setLastUpdate: Dispatch<SetStateAction<Date>>;
}

const Refresh = <T,>({ lastUpdate, setItems, getItems, setLastUpdate }: RefreshProps<T>) => {

    const handleRefresh = async () => {
        try {
            const items = await getItems();
            setItems(items);
            setLastUpdate(new Date());
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex items-center gap-3">
            <button onClick={handleRefresh}><HiOutlineRefresh /></button>
            <label className="text-gray-800">Atualizado em {lastUpdate.getHours() + ':' + lastUpdate.getMinutes()}</label>
        </div>
    );
}

export default Refresh;
