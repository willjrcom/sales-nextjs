import GetTables from '@/app/api/table/route';
import Table from '@/app/entities/table/table';
import React, { createContext, useContext, ReactNode } from 'react';
import GenericProvider, { ItemsContextProps } from '../props';

const ContextTable = createContext<ItemsContextProps<Table> | undefined>(undefined);

export const TableProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Table>({ getItems: GetTables });
    return (
        <ContextTable.Provider value={values}>
            {children}
        </ContextTable.Provider>
    );
};

export const useTables = () => {
    const context = useContext(ContextTable);
    if (!context) {
        throw new Error('useTables must be used within a TableProvider');
    }
    return context;
};
