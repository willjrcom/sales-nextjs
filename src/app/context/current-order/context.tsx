import CurrentOrder from '@/app/entities/order/order';
import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/api/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GetOrderByID from '@/app/api/order/[id]/route';
import Order from '@/app/entities/order/order';
import GroupItem from '@/app/entities/order/group-item';

interface CurrentOrderContextProps<T> {
    order: T | null;
    getGroupByID: (id: string) => GroupItem[] | undefined;
    fetchData: (id?: string) => void;
    updateCurrentOrder: (item: T) => void;
    removeCurrentOrder: () => void;
    updateLastUpdate: () => void;
    getError: () => RequestError | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextCurrentOrder = createContext<CurrentOrderContextProps<CurrentOrder> | undefined>(undefined);

export const CurrentOrderProvider = ({ children }: { children: ReactNode }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<RequestError | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    const idToken = data?.user.idToken;
    
    const fetchData = useCallback(async (id?: string) => {
        if (!idToken || !id) return;
        try {
            const order = await GetOrderByID(id as string, data);
            setOrder(order);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }

        setLoading(false);

    }, [idToken, setOrder, data, setError, setLoading]);

    const getGroupByID = (id: string) => {
        return order?.groups.filter((order) => order.id === id);
    }

    const updateCurrentOrder = (order: Order) => {
        setOrder(order);
    }

    const removeCurrentOrder = () => {
        setOrder(null);
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextCurrentOrder.Provider value={{ order, fetchData, getGroupByID, updateCurrentOrder: updateCurrentOrder, removeCurrentOrder, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextCurrentOrder.Provider>
    );
};

export const useCurrentOrder = () => {
    const context = useContext(ContextCurrentOrder);
    if (!context) {
        throw new Error('useItems must be used within a CurrentOrderProvider');
    }
    return context;
};
