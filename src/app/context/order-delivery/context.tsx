
import React, { createContext, useContext, ReactNode} from 'react';
import GenericProvider, { ItemsContextProps } from '../props';
import GetDeliveryOrders from '@/app/api/order-delivery/route';
import OrderDelivery from '@/app/entities/order/order-delivery';

const ContextDeliveryOrder = createContext<ItemsContextProps<OrderDelivery> | undefined>(undefined);

export const DeliveryOrderProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<OrderDelivery>({ getItems: GetDeliveryOrders });

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
