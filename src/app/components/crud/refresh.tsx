import { ItemsContextProps } from "@/app/context/props";
import { GenericState } from "@/redux/slices/generics";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useDispatch } from "react-redux";

interface RefreshProps<T> {
    fetchItems?: (session: Session) => any; // Ajuste para refletir o tipo de ação válida
    context?: ItemsContextProps<T>;
    slice: GenericState;
}

const Refresh = <T extends { id: string }>({ fetchItems, slice }: RefreshProps<T>) => {
    const dispatch = useDispatch();
    const { data } = useSession();

    const [isRefreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!data || !fetchItems || isRefreshing) return;
        setRefreshing(true);
        try {
            dispatch(fetchItems(data));
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        } finally {
            setRefreshing(false);
        }
    };

    if (slice.loading) {
        return (
            <div className="flex items-center gap-3">
                <button disabled><HiOutlineRefresh /></button>
                <label className="text-gray-800">Atualizando...</label>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-3">
            <button onClick={handleRefresh}><HiOutlineRefresh /></button>
            <label className="text-gray-800">Atualizado em {slice.lastUpdate}</label>
        </div>
    );
};

const FormatRefreshTime = (lastUpdate: Date): string => {
    return lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default Refresh;
export { FormatRefreshTime };
