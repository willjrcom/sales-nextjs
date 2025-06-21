 'use client';
import Order from '@/app/entities/order/order';
import React, { createContext, useContext, ReactNode, useState, useCallback} from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/utils/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GetOrderByID from '@/app/api/order/[id]/order';
import { notifyError } from '@/app/utils/notifications';

interface CurrentOrderContextProps<T> {
    order: T | null;
    fetchData: (id?: string) => Promise<void>;
    updateLastUpdate: () => void;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextCurrentOrder = createContext<CurrentOrderContextProps<Order> | undefined>(undefined);

export const CurrentOrderProvider = ({ children }: { children: ReactNode }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    
    const fetchData = useCallback(async (id?: string) => {
        if (!data?.user.access_token) return;
        
        if (!id) {
            id = order?.id;
        }

        if (!id) return;

        try {
            const orderFound = await GetOrderByID(id as string, data);
            setOrder(orderFound);
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar pedido atual");
        }

        setLoading(false);

    }, [data?.user.access_token, order?.id]);

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextCurrentOrder.Provider value={{ order, fetchData, updateLastUpdate, getLoading, getLastUpdate }}>
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
