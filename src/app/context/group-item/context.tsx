import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/utils/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GroupItem from '@/app/entities/order/group-item';
import Item from '@/app/entities/order/item';
import GetGroupItemByID from '@/app/api/group-item/[id]/group-item';
import { notifyError } from '@/app/utils/notifications';

interface GroupItemContextProps<T> {
    groupItem: T | null;
    getItemByID: (id: string) => Item[] | undefined;
    fetchData: (id: string) => Promise<GroupItem | null | undefined>;
    resetGroupItem: () => void;
    addItem: (item: Item) => void;
    removeItem: (id: string) => void;
    updateGroupItem: (item: T) => void;
    updateLastUpdate: () => void;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextGroupItem = createContext<GroupItemContextProps<GroupItem> | undefined>(undefined);

export const GroupItemProvider = ({ children }: { children: ReactNode }) => {
    const [groupItem, setgroupItem] = useState<GroupItem | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    
    const fetchData = async (id: string) => {
        if (!data?.user?.access_token || !id) return;
        try {
            const groupItem = await GetGroupItemByID(id, data);
            setgroupItem(groupItem);
            return groupItem;
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao buscar group item");
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

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextGroupItem.Provider value={{ groupItem, fetchData, resetGroupItem, getItemByID, addItem, removeItem, updateGroupItem: updateGroupItem, updateLastUpdate, getLoading, getLastUpdate }}>
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
