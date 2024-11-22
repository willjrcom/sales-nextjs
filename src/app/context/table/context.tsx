import GetTables from '@/app/api/table/route';
import Table from '@/app/entities/table/table';
import React, { createContext, useContext, ReactNode } from 'react';
import GenericProvider, { ItemContextProps } from '../props';

const ContextTable = createContext<ItemContextProps<Table> | undefined>(undefined);

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
        throw new Error('useItems must be used within a TableProvider');
    }
    return context;
};
