import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/api/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GroupItem from '@/app/entities/order/group-item';
import Item from '@/app/entities/order/item';
import GetGroupItemByID from '@/app/api/group-item/[id]/route';

interface GroupItemContextProps<T> {
    groupItem: T | null;
    getItemByID: (id: string) => Item[] | undefined;
    fetchData: (id: string) => Promise<GroupItem | null | undefined>;
    resetGroupItem: () => void;
    addItem: (item: Item) => void;
    removeItem: (id: string) => void;
    updateGroupItem: (item: T) => void;
    removeGroupItem: () => void;
    updateLastUpdate: () => void;
    getError: () => RequestError | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextGroupItem = createContext<GroupItemContextProps<GroupItem> | undefined>(undefined);

export const GroupItemProvider = ({ children }: { children: ReactNode }) => {
    const [groupItem, setgroupItem] = useState<GroupItem | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<RequestError | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    
    const fetchData = async (id: string) => {
        if (!data?.user?.idToken || !id) return;
        try {
            const groupItem = await GetGroupItemByID(id, data);
            setgroupItem(groupItem);
            setError(null);
            return groupItem;
        } catch (error) {
            setError(error as RequestError);
            return null;
        }
    };

    const resetGroupItem = () => {
        setgroupItem(null);
    }

    const getItemByID = (id: string) => {
        return groupItem?.items.filter((groupItem) => groupItem.id === id);
    }

    const addItem = (item: Item) => {
        if (!groupItem) return;
        setgroupItem({...groupItem, items: [...groupItem.items, item]});
    }

    const removeItem = (id: string) => {
        if (!groupItem) return;
        setgroupItem({...groupItem, items: groupItem.items.filter((item) => item.id !== id)});
    }

    const updateGroupItem = (groupItem: GroupItem) => {
        setgroupItem(groupItem);
    }

    const removeGroupItem = () => {
        setgroupItem(null);
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextGroupItem.Provider value={{ groupItem, fetchData, resetGroupItem, getItemByID, addItem, removeItem, updateGroupItem: updateGroupItem, removeGroupItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
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
