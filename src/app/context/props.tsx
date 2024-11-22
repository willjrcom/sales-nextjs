export interface ItemContextProps<T> {
    items: T[];
    filterItems?: (key: keyof T, value: string) => T[];
    fetchData: (id?: string) => void;
    setItemsState: (items: T[]) => void;
    addItem: (product: T) => void;
    removeItem: (id: string) => void;
    updateLastUpdate: () => void;
    getError: () => string | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}