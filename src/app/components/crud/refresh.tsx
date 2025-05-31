import { FetchItemsArgs, GenericState } from "@/redux/slices/generics";
import { AppDispatch } from "@/redux/store";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Loading from "../loading/Loading";
import { HiOutlineRefresh } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { notifyError } from "@/app/utils/notifications";

interface RefreshProps {
    /**
     * Fetch items thunk, receives session, page, perPage
     */
    fetchItems?: (data: FetchItemsArgs) => any;
    /**
     * Fetch by ID thunk
     */
    fetchItemsByID?: (params: { id: string; session: Session }) => any;
    /** ID for fetchItemsByID */
    id?: string;
    /** Current page (1-based) */
    page?: number;
    /** Items per page */
    perPage?: number;
    /** Generic slice for loading and lastUpdate */
    slice: GenericState;
    /** Hide text label */
    removeText?: boolean;
}

const Refresh = ({ fetchItems, fetchItemsByID, id, page, perPage, slice, removeText }: RefreshProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    const [isRefreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!data || (!fetchItems && !fetchItemsByID) || isRefreshing) return;
        setRefreshing(true);
        try {
            if (fetchItems) {
                dispatch(fetchItems({ session: data, page: page, perPage: perPage }));
            } else if (fetchItemsByID && id) {
                dispatch(fetchItemsByID({ id, session: data }));

            }
        } catch (error) {
            notifyError("Erro ao atualizar os dados:" + error);
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
