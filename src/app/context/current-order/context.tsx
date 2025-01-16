import Order from '@/app/entities/order/order';
import React, { createContext, useContext, ReactNode, useState, useCallback} from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/api/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GetOrderByID from '@/app/api/order/[id]/order';
import GroupItem from '@/app/entities/order/group-item';

interface CurrentOrderContextProps<T> {
    order: T | null;
    fetchData: (id?: string) => Promise<void>;
    updateLastUpdate: () => void;
    getError: () => RequestError | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextCurrentOrder = createContext<CurrentOrderContextProps<Order> | undefined>(undefined);

export const CurrentOrderProvider = ({ children }: { children: ReactNode }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<RequestError | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    
    const fetchData = useCallback(async (id?: string) => {
        if (!data?.user.idToken) return;
        
        if (!id) {
            id = order?.id;
        }

        try {
            const orderFound = await GetOrderByID(id as string, data);
            setOrder(orderFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }

        setLoading(false);

    }, [data?.user.idToken]);

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextCurrentOrder.Provider value={{ order, fetchData, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextCurrentOrder.Provider>
    );
};

export const useCurrentOrder = () => {
    const context = useContext(ContextCurrentOrder);
    if (!context) {
        throw new Error('useCurrentOrder must be used within a CurrentOrderProvider');
    }
    return context;
};
