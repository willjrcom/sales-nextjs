'use client';

import FetchData from '@/app/api/fetch-data';
import GetClients from '@/app/api/client/route';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import Client from '@/app/entities/client/client';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ItemContextProps } from '../props';

const ContextClient = createContext<ItemContextProps<Client> | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Client[]>([]);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);

    const fetchData = useCallback(async () => {
        if (!data?.user.idToken) return;
        FetchData({ getItems: GetClients, setItems: setItems, data, setError, setLoading })
    }, [data?.user.idToken!]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setItemsState = (items: Client[]) => {
        setItems(items);
    }

    const addItem = (client: Client) => {
        setItems((prev) => [...prev, client]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((client) => client.id !== id));
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextClient.Provider value={{ items, fetchData, setItemsState, addItem, removeItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextClient.Provider>
    );
};

export const useClients = () => {
    const context = useContext(ContextClient);
    if (!context) {
        throw new Error('useClients must be used within a ClientProvider');
    }
    return context;
};
