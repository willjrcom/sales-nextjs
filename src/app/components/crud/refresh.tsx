import { HiOutlineRefresh } from "react-icons/hi";

interface RefreshProps {
    /** React Query refetch function */
    onRefresh: () => void;
    /** Hide text label */
    removeText?: boolean;
    /** Last update time formatted */
    lastUpdate?: string;
    /** Loading state */
    isPending?: boolean;
    optionalText?: string;
}

const Refresh = ({ onRefresh, removeText, lastUpdate, isPending, optionalText }: RefreshProps) => {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={!isPending ? onRefresh : undefined}
                disabled={isPending}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <HiOutlineRefresh className="h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                    <HiOutlineRefresh className="h-5 w-5 text-gray-800" />
                )}
            </button>
            {!optionalText && !removeText && lastUpdate && (
                <label className="text-gray-800">{`Atualizado em ${lastUpdate}`}</label>
            )}
            {optionalText && lastUpdate && (
                <label className="text-gray-800">{optionalText} atualizado em {lastUpdate}</label>
            )}
            {optionalText && !lastUpdate && (
                <label className="text-gray-800">{optionalText}</label>
            )}
        </div>
    );
};

const FormatRefreshTime = (lastUpdate: Date): string => {
    return lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default Refresh;
export { FormatRefreshTime };
