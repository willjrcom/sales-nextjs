'use client';

import FetchData from '@/app/api/fetch-data';
import GetCategorys from '@/app/api/category/route';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import Category from '@/app/entities/category/category';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ItemContextProps } from '../props';

const ContextCategory = createContext<ItemContextProps<Category> | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Category[]>([]);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);

    const fetchData = useCallback(async () => {
        if (!data?.user.idToken) return;
        FetchData({ getItems: GetCategorys, setItems: setItems, data, setError, setLoading })
    }, [data?.user.idToken!]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setItemsState = (items: Category[]) => {
        setItems(items);
    }

    const addItem = (category: Category) => {
        setItems((prev) => [...prev, category]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((category) => category.id !== id));
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextCategory.Provider value={{ items, fetchData, setItemsState, addItem, removeItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextCategory.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(ContextCategory);
    if (!context) {
        throw new Error('useItems must be used within a ItemsProvider');
    }
    return context;
};
