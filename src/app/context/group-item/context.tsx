import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/api/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GetgroupItemByID from '@/app/api/order/[id]/route';
import GroupItem from '@/app/entities/order/group-item';
import { Item } from '@/app/entities/order/item';

interface GroupItemContextProps<T> {
    groupItem: T | null;
    getItemByID: (id: string) => Item[] | undefined;
    fetchData: (id?: string) => void;
    updateGroupItem: (item: T) => void;
    removeGroupItem: () => void;
    updateLastUpdate: () => void;
    getError: () => RequestError | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextGroupItem = createContext<GroupItemContextProps<GroupItem> | undefined>(undefined);

export const GroupItemProvider = ({ children }: { children: ReactNode }) => {
    const [groupItem, GetgroupItem] = useState<GroupItem | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<RequestError | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    const idToken = data?.user.idToken;
    
    const fetchData = useCallback(async (id?: string) => {
        if (!idToken) return;
        try {
            const order = await GetgroupItemByID(id as string, data);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }

        setLoading(false);

    }, [idToken, GetgroupItem, data, setError, setLoading]); // Inclua todas as dependências necessárias


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getItemByID = (id: string) => {
        return groupItem?.items.filter((groupItem) => groupItem.id === id);
    }

    const updateGroupItem = (groupItem: GroupItem) => {
        GetgroupItem(groupItem);
    }

    const removeGroupItem = () => {
        GetgroupItem(null);
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextGroupItem.Provider value={{ groupItem, fetchData, getItemByID, updateGroupItem: updateGroupItem, removeGroupItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextGroupItem.Provider>
    );
};

export const useGroupItem = () => {
    const context = useContext(ContextGroupItem);
    if (!context) {
        throw new Error('useGroupItem must be used within a GroupItemProvider');
    }
    return context;
};
