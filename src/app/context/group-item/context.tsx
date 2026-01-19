'use client';
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GroupItem from '@/app/entities/order/group-item';
import Item from '@/app/entities/order/item';
import GetGroupItemByID from '@/app/api/group-item/[id]/group-item';
import { notifyError } from '@/app/utils/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface GroupItemContextProps {
    groupItem: GroupItem | null;
    getItemByID: (id: string) => Item[] | undefined;
    fetchData: (id: string) => Promise<GroupItem | null | undefined>;
    resetGroupItem: () => void;
    addItem: (item: Item) => void;
    removeItem: (id: string) => void;
    updateGroupItem: (item: GroupItem) => void;
    updateLastUpdate: () => void;
    getLoading: () => boolean;
    getLastUpdate: () => string;
    refetch: () => void;
}

const ContextGroupItem = createContext<GroupItemContextProps | undefined>(undefined);

export const GroupItemProvider = ({ children }: { children: ReactNode }) => {
    const [groupItemId, setGroupItemId] = useState<string | null>(null);
    const [localGroupItem, setLocalGroupItem] = useState<GroupItem | null>(null);
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { data: fetchedGroupItem, isLoading, refetch } = useQuery({
        queryKey: ['group-item', groupItemId],
        queryFn: async () => {
            if (!groupItemId || !session?.user?.access_token) return null;
            try {
                const result = await GetGroupItemByID(groupItemId, session);
                setLastUpdate(FormatRefreshTime(new Date()));
                return result;
            } catch (error: any) {
                notifyError(error.message || "Erro ao buscar group item");
                return null;
            }
        },
        enabled: !!groupItemId && !!session?.user?.access_token,
        staleTime: 0,
    });

    // Usa o localGroupItem se existir, senão usa o fetchedGroupItem
    const groupItem = localGroupItem ?? fetchedGroupItem ?? null;

    const fetchData = useCallback(async (id: string) => {
        if (!session?.user?.access_token || !id) return;
        setGroupItemId(id);
        setLocalGroupItem(null); // Reset local state para usar os dados da query

        // Invalida e refetch
        await queryClient.invalidateQueries({ queryKey: ['group-item', id] });
        const result = await queryClient.fetchQuery({
            queryKey: ['group-item', id],
            queryFn: () => GetGroupItemByID(id, session),
        });
        return result;
    }, [session, queryClient]);

    const resetGroupItem = useCallback(() => {
        setGroupItemId(null);
        setLocalGroupItem(null);
    }, []);

    const getItemByID = useCallback((id: string) => {
        return groupItem?.items.filter((item) => item.id === id);
    }, [groupItem]);

    const addItem = useCallback((item: Item) => {
        if (!groupItem) return;
        const updated = { ...groupItem, items: [...groupItem.items, item] };
        setLocalGroupItem(updated as GroupItem);
        // Atualiza o cache do React Query também
        if (groupItemId) {
            queryClient.setQueryData(['groupItem', groupItemId], updated);
        }
    }, [groupItem, groupItemId, queryClient]);

    const removeItem = useCallback((id: string) => {
        if (!groupItem) return;
        const updated = { ...groupItem, items: groupItem.items.filter((item) => item.id !== id) };
        setLocalGroupItem(updated as GroupItem);
        if (groupItemId) {
            queryClient.setQueryData(['groupItem', groupItemId], updated);
        }
    }, [groupItem, groupItemId, queryClient]);

    const updateGroupItem = useCallback((newGroupItem: GroupItem) => {
        setLocalGroupItem(newGroupItem);
        if (newGroupItem.id) {
            setGroupItemId(newGroupItem.id);
            queryClient.setQueryData(['groupItem', newGroupItem.id], newGroupItem);
        }
    }, [queryClient]);

    const updateLastUpdate = useCallback(() => {
        setLastUpdate(FormatRefreshTime(new Date()));
    }, []);

    const getLoading = useCallback(() => isLoading, [isLoading]);
    const getLastUpdate = useCallback(() => lastUpdate, [lastUpdate]);

    const handleRefetch = useCallback(() => {
        if (groupItemId) {
            queryClient.invalidateQueries({ queryKey: ['group-item', groupItemId] });
            refetch();
        }
    }, [groupItemId, queryClient, refetch]);

    return (
        <ContextGroupItem.Provider value={{
            groupItem,
            fetchData,
            resetGroupItem,
            getItemByID,
            addItem,
            removeItem,
            updateGroupItem,
            updateLastUpdate,
            getLoading,
            getLastUpdate,
            refetch: handleRefetch,
        }}>
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
