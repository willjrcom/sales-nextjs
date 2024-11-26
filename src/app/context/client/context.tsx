import GetClients from '@/app/api/client/route';
import Client from '@/app/entities/client/client';
import React, { createContext, useContext, ReactNode} from 'react';
import GenericProvider, { ItemsContextProps } from '../props';

const ContextClient = createContext<ItemsContextProps<Client> | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Client>({ getItems: GetClients });
    return (
        <ContextClient.Provider value={values}>
            {children}
        </ContextClient.Provider>
    );
};

export const useClients = () => {
    const context = useContext(ContextClient);
    if (!context) {
        throw new Error('useClients must be used within a ClientProvider');
    }
    return context;
};
