import GetAllDeliveryDrivers from '@/app/api/delivery-driver/route';
import React, { createContext, useContext, ReactNode } from 'react';
import GenericProvider, { ItemsContextProps } from '../props';
import DeliveryDriver from '@/app/entities/delivery-driver/delivery-driver';

const ContextDeliveryDriver = createContext<ItemsContextProps<DeliveryDriver> | undefined>(undefined);

export const DeliveryDriverProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<DeliveryDriver>({ getItems: GetAllDeliveryDrivers });

    return (
        <ContextDeliveryDriver.Provider value={values}>
            {children}
        </ContextDeliveryDriver.Provider>
    );
};

export const useDeliveryDrivers = () => {
    const context = useContext(ContextDeliveryDriver);
    if (!context) {
        throw new Error('useDeliveryDrivers must be used within a DeliveryDriversProvider');
    }
    return context;
};
