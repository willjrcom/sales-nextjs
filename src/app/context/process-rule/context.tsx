'use client';

import { FormatRefreshTime } from '@/app/components/crud/refresh';
import ProcessRule from '@/app/entities/process-rule/process-rule';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ItemContextProps } from '../props';
import GetProcessRules from '@/app/api/process-rule/route';
import FetchData from '@/app/api/fetch-data';

const ContextProcessRule = createContext<ItemContextProps<ProcessRule> | undefined>(undefined);

export const ProcessRuleProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<ProcessRule[]>([]);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);

    const fetchData = useCallback(async () => {
        if (!data?.user.idToken) return;    
        FetchData({ getItems: GetProcessRules, setItems, data, setError, setLoading })
    }, [data?.user.idToken!]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filterItems = (key: keyof ProcessRule, value: string) => {
        return items.filter((processRule) => processRule[key!] === value);
    };
    

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
        <ContextProcessRule.Provider value={{ items, filterItems, fetchData, setItemsState, addItem, removeItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextProcessRule.Provider>
    );
};

export const useProcessRules = () => {
    const context = useContext(ContextProcessRule);
    if (!context) {
        throw new Error('useItems must be used within a ProcessRuleProvider');
    }
    return context;
};
