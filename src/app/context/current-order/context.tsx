import CurrentOrder from '@/app/entities/order/order';
import React, { createContext, useContext, ReactNode, useState, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import RequestError from '@/app/api/error';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import GetOrderByID from '@/app/api/order/[id]/route';
import Order from '@/app/entities/order/order';
import GroupItem from '@/app/entities/order/group-item';

interface CurrentOrderContextProps<T> {
    order: T | null;
    getGroupByID: (id: string) => GroupItem[] | undefined;
    getGroupByCategoryID: (id: string) => GroupItem[] | undefined;
    fetchData: (id?: string) => Promise<void>;
    updateCurrentOrder: (item: T) => void;
    addGroupItem: (item: GroupItem) => void;
    removeGroupItem: (item: GroupItem) => void;
    updateGroupItem: (item: GroupItem) => void;
    removeCurrentOrder: () => void;
    updateLastUpdate: () => void;
    getError: () => RequestError | null;
    getLoading: () => boolean;
    getLastUpdate: () => string;
}

const ContextCurrentOrder = createContext<CurrentOrderContextProps<CurrentOrder> | undefined>(undefined);

export const CurrentOrderProvider = ({ children }: { children: ReactNode }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<RequestError | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);
    
    const fetchData = async (id?: string) => {
        if (!data?.user?.idToken || !id) return;
        try {
            const order = await GetOrderByID(id as string, data);
            setOrder(order);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }

        setLoading(false);
    };

    const getGroupByID = (id: string) => {
        return order?.groups.filter((order) => order.id === id);
    }

    const getGroupByCategoryID = (id: string) => {
        return order?.groups.filter((order) => order.category_id === id);
    }

    const updateCurrentOrder = (order: Order) => {
        setOrder(order);
    }

    const addGroupItem = (item: GroupItem) => {
        if (!order) return;
        setOrder({...order, groups: [...order.groups, item]});
    }

    const updateGroupItem = (item: GroupItem) => {
        if (!order) return;
        if (!order.groups || order.groups.length === 0) {
            setOrder({...order, groups: [item]});
            return
        }

        const newGroupItem = order.groups?.find((groupItem) => groupItem.id === item.id);
        if (!newGroupItem) return;
        
        newGroupItem.items = item.items;
        setOrder({...order, groups: order.groups.map((groupItem) => groupItem.id === item.id ? newGroupItem : groupItem)});
    }

    const removeGroupItem = (item: GroupItem) => {
        if (!order) return;
        setOrder({ ...order, groups: order.groups.filter((groupItem) => groupItem.id !== item.id) });
    }

    const removeCurrentOrder = () => {
        setOrder(null);
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextCurrentOrder.Provider value={{ order, fetchData, getGroupByID, getGroupByCategoryID, updateCurrentOrder, addGroupItem, updateGroupItem, removeGroupItem, removeCurrentOrder, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextCurrentOrder.Provider>
    );
};

export const useCurrentOrder = () => {
    const context = useContext(ContextCurrentOrder);
    if (!context) {
        throw new Error('useItems must be used within a CurrentOrderProvider');
    }
    return context;
};
