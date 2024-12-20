import React, { createContext, useContext, ReactNode, useState, useCallback} from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/api/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import { OrderProcess } from '@/app/entities/order-process/order-process';
import GetProcessesByProcessRuleID from '@/app/api/order-process/by-process-rule/route';

interface CurrentProcessRuleContextProps<T> {
    orderProcesses: T[] | null;
    fetchData: (id: string) => Promise<void>;
    updateLastUpdate: () => void;
    getError: () => RequestError | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextCurrentProcessRule = createContext<CurrentProcessRuleContextProps<OrderProcess> | undefined>(undefined);

export const CurrentProcessRuleProvider = ({ children }: { children: ReactNode }) => {
    const [orderProcesses, setOrderProcesses] = useState<OrderProcess[] | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<RequestError | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    
    const fetchData = useCallback(async (id: string) => {
        if (!data?.user.idToken) return;

        try {
            const processesFound = await GetProcessesByProcessRuleID(id, data);
            setOrderProcesses(processesFound);
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
        <ContextCurrentProcessRule.Provider value={{ orderProcesses, fetchData, updateLastUpdate, getError, getLoading, getLastUpdate }}>
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
