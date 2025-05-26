import { GenericState } from "@/redux/slices/generics";
import { AppDispatch } from "@/redux/store";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Loading from "../loading/Loading";
import { HiOutlineRefresh } from "react-icons/hi";
import { useDispatch } from "react-redux";

interface RefreshProps{
    fetchItems?: (session: Session) => any;
    fetchItemsByID?: (params: { id: string; session: Session }) => any;
    id?: string;
    slice: GenericState;
    removeText?: boolean;
}

const Refresh = ({ fetchItems, fetchItemsByID, id, slice, removeText }: RefreshProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    const [isRefreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!data || (!fetchItems && !fetchItemsByID) || isRefreshing) return;
        setRefreshing(true);
        try {
            if (fetchItems) {
                dispatch(fetchItems(data));
            } else if (fetchItemsByID && id) {
                dispatch(fetchItemsByID({id, session: data}));

            }
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const isLoading = slice.loading || isRefreshing;
    return (
        <div className="flex items-center gap-3">
            <button onClick={!isLoading ? handleRefresh : undefined} disabled={isLoading}>
                {isLoading ? <Loading /> : <HiOutlineRefresh className="h-5 w-5 text-gray-800" />}
            </button>
            {!removeText && (
                <label className="text-gray-800">{`Atualizado em ${slice.lastUpdate}`}</label>
            )}
        </div>
    );
};

const FormatRefreshTime = (lastUpdate: Date): string => {
    return lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default Refresh;
export { FormatRefreshTime };
