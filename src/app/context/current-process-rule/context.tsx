"use client";
import React, { createContext, useContext, ReactNode, useState, useCallback} from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/utils/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import OrderProcess from '@/app/entities/order-process/order-process';
import GetProcessesByProcessRuleID from '@/app/api/order-process/by-process-rule/order-process';
import { notifyError } from '@/app/utils/notifications';

interface CurrentProcessRuleContextProps<T> {
    orderProcesses: T[] | null;
    fetchData: (id: string) => Promise<void>;
    updateLastUpdate: () => void;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextCurrentProcessRule = createContext<CurrentProcessRuleContextProps<OrderProcess> | undefined>(undefined);

export const CurrentProcessRuleProvider = ({ children }: { children: ReactNode }) => {
    const [orderProcesses, setOrderProcesses] = useState<OrderProcess[] | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    
    const fetchData = useCallback(async (id: string) => {
        if (!data?.user.access_token) return;

        try {
            const processesFound = await GetProcessesByProcessRuleID(id, data);
            setOrderProcesses(processesFound.items);
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar processos");
        }

        setLoading(false);

    }, [data?.user.access_token]);

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextCurrentProcessRule.Provider value={{ orderProcesses, fetchData, updateLastUpdate, getLoading, getLastUpdate }}>
            {children}
        </ContextCurrentProcessRule.Provider>
    );
};

export const useCurrentProcessRule = () => {
    const context = useContext(ContextCurrentProcessRule);
    if (!context) {
        throw new Error('useCurrentProcessRule must be used within a CurrentProcessRuleProvider');
    }
    return context;
};
