import { ItemsContextProps } from "@/app/context/props";
import { HiOutlineRefresh } from "react-icons/hi";

interface RefreshProps<T> {
    context: ItemsContextProps<T>;
}

const Refresh = <T,>({ context }: RefreshProps<T>) => {
    const handleRefresh = async () => {
        try {
            context.fetchData();
            context.updateLastUpdate();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="flex items-center gap-3">
            <button onClick={handleRefresh}><HiOutlineRefresh /></button>
            <label className="text-gray-800">Atualizado em {context.getLastUpdate()}</label>
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
