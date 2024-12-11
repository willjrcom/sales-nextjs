
import React, { createContext, useContext, ReactNode} from 'react';
import GenericProvider, { ItemsContextProps } from '../props';
import GetOrdersWithDelivery from '@/app/api/order/all/delivery/route';
import Order from '@/app/entities/order/order';

const ContextDeliveryOrder = createContext<ItemsContextProps<Order> | undefined>(undefined);

export const DeliveryOrderProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Order>({ getItems: GetOrdersWithDelivery });

    return (
        <ContextDeliveryOrder.Provider value={values}>
            {children}
        </ContextDeliveryOrder.Provider>
    );
};

export const useDeliveryOrders = () => {
    const context = useContext(ContextDeliveryOrder);
    if (!context) {
        throw new Error('useDeliveryOrders must be used within a DeliveryOrderProvider');
    }
    return context;
};
