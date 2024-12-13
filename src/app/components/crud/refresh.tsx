import { ItemsContextProps } from "@/app/context/props";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useDispatch } from "react-redux";

interface RefreshProps<T> {
    fetchItems?: (session: Session) => any; // Ajuste para refletir o tipo de ação válida
    context?: ItemsContextProps<T>;
    lastUpdate: string;
}

const Refresh = <T extends { id: string }>({ context, fetchItems, lastUpdate }: RefreshProps<T>) => {
    const dispatch = useDispatch();
    const { data } = useSession();

    const handleRefresh = async () => {
        try {
            if (!data || !fetchItems) return;

            // Dispara a ação do Redux para buscar os itens
            dispatch(fetchItems(data)); // Passa a session para o thunk
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button onClick={handleRefresh}><HiOutlineRefresh /></button>
            <label className="text-gray-800">Atualizado em {lastUpdate}</label>
        </div>
    );
};

const FormatRefreshTime = (lastUpdate: Date): string => {
    const hours = lastUpdate.getHours();
    const minutes = lastUpdate.getMinutes() < 10 ? '0' + lastUpdate.getMinutes() : lastUpdate.getMinutes();
    return hours + ':' + minutes;
};

export default Refresh;
export { FormatRefreshTime };
