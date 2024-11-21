export interface ItemContextProps<T> {
    items: T[];
    fetchData: () => void;
    setItemsState: (items: T[]) => void;
    addItem: (product: T) => void;
    removeItem: (id: string) => void;
    updateLastUpdate: () => void;
    getError: () => string | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}