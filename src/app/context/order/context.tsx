import GetOrders from '@/app/api/order/route';
import Order from '@/app/entities/order/order';
import React, { createContext, useContext, ReactNode} from 'react';
import GenericProvider, { ItemsContextProps } from '../props';

const ContextOrder = createContext<ItemsContextProps<Order> | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Order>({ getItems: GetOrders });

    return (
        <ContextOrder.Provider value={values}>
            {children}
        </ContextOrder.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(ContextOrder);
    if (!context) {
        throw new Error('useOrders must be used within a OrderProvider');
    }
    return context;
};
