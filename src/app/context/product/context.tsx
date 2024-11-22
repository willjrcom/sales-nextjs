'use client';

import FetchData from '@/app/api/fetch-data';
import GetProducts from '@/app/api/product/route';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import Product from '@/app/entities/product/product';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ItemContextProps } from '../props';

const ContextProduct = createContext<ItemContextProps<Product> | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Product[]>([]);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);

    const fetchData = useCallback(async () => {
        if (!data?.user.idToken) return;
        FetchData({ getItems: GetProducts, setItems: setItems, data, setError, setLoading })
    }, [data?.user.idToken!]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setItemsState = (items: Product[]) => {
        setItems(items);
    }

    const addItem = (product: Product) => {
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
        <ContextProduct.Provider value={{ items, fetchData, setItemsState, addItem , removeItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextProduct.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ContextProduct);
    if (!context) {
        throw new Error('useItems must be used within a ProductProvider');
    }
    return context;
};
