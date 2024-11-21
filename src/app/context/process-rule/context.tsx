'use client';

import { FormatRefreshTime } from '@/app/components/crud/refresh';
import ProcessRule from '@/app/entities/process-rule/process-rule';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ItemContextProps } from '../props';
import GetProcessRulesByCategoryID from '@/app/api/process-rule/route';

const ContextProcessRule = createContext<ItemContextProps<ProcessRule> | undefined>(undefined);

export const ProcessRuleProvider = ({ children, id }: { children: ReactNode, id: string }) => {
    const [items, setItems] = useState<ProcessRule[]>([]);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);

    const fetchData = useCallback(async (id?: string) => {
        if (!data?.user.idToken) return;
        setItems(await GetProcessRulesByCategoryID(id!, data));
        setLoading(false);
        setError(null);
    }, [data?.user.idToken!]);

    useEffect(() => {
        fetchData(id);
    }, [fetchData]);

    const setItemsState = (items: ProcessRule[]) => {
        setItems(items);
    }

    const addItem = (product: ProcessRule) => {
        setItems((prev) => [...prev, product]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((product) => product.id !== id));
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextProcessRule.Provider value={{ items, fetchData, setItemsState, addItem, removeItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextProcessRule.Provider>
    );
};

export const useProcessRules = () => {
    const context = useContext(ContextProcessRule);
    if (!context) {
        throw new Error('useItems must be used within a ItemsProvider');
    }
    return context;
};
