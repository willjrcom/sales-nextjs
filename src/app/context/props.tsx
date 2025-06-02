import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { FormatRefreshTime } from "../components/crud/refresh";
import FetchData from "../api/fetch-data";
import { Session } from "next-auth";
import RequestError from "../utils/error";

export interface ItemsContextProps<T> {
    items: T[];
    filterItems: (key: keyof T, value: string) => T[];
    findByID: (id: string) => T | undefined;
    fetchData: (id?: string) => Promise<void>;
    setItemsState: (items: T[]) => void;
    addItem: (item: T) => void;
    updateItem: (item: T) => void;
    removeItem: (id: string) => void;
    updateLastUpdate: () => void;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

interface GenericProviderProps<T> {
    getItems: (session: Session) => Promise<T[]>
}

const GenericProvider = <T extends { id: string },>({ getItems }: GenericProviderProps<T>) => {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    const { data } = useSession();

    const fetchData = useCallback(async () => {
        if (!data?.user?.access_token) return; 
        FetchData({ getItems, setItems, data, setLoading });
    }, [data, getItems]);

    useEffect(() => {
        fetchData();
    }, [data?.user.access_token]);

    const filterItems = (key: keyof T, value: string) => {
        if (!value) return items;
        return items.filter((item) => String(item[key]).toLowerCase().includes(value.toLowerCase()));
    }

    const findByID = (id: string) => {
        return items.find((item) => item.id === id);
    }

    const setItemsState = (items: T[]) => {
        setItems(items);
    }

    const addItem = (item: T) => {
        setItems((prev) => [...prev, item]);
    };

    const updateItem = (item: T) => {
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return { items, fetchData, findByID, filterItems, setItemsState, addItem, updateItem, removeItem, updateLastUpdate, getLoading, getLastUpdate }
}

export default GenericProvider