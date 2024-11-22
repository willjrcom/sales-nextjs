import FetchData from '@/app/api/fetch-data';
import GetPlaces from '@/app/api/place/route';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import Place from '@/app/entities/place/place';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ItemContextProps } from '../props';

const ContextPlace = createContext<ItemContextProps<Place> | undefined>(undefined);

export const PlaceProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Place[]>([]);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);

    const fetchData = useCallback(async () => {
        if (!data?.user.idToken) return;
        FetchData({ getItems: GetPlaces, setItems: setItems, data, setError, setLoading })
    }, [data?.user.idToken!]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setItemsState = (items: Place[]) => {
        setItems(items);
    }

    const addItem = (place: Place) => {
        setItems((prev) => [...prev, place]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((place) => place.id !== id));
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextPlace.Provider value={{ items, fetchData, setItemsState, addItem, removeItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextPlace.Provider>
    );
};

export const usePlaces = () => {
    const context = useContext(ContextPlace);
    if (!context) {
        throw new Error('useItems must be used within a PlaceProvider');
    }
    return context;
};
