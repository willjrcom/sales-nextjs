'use client';

import FetchData from '@/app/api/fetch-data';
import GetEmployees from '@/app/api/employee/route';
import { FormatRefreshTime } from '@/app/components/crud/refresh';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ItemContextProps } from '../props';
import Employee from '@/app/entities/employee/employee';

const ContextEmployee = createContext<ItemContextProps<Employee> | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
    const [items, setEmployees] = useState<Employee[]>([]);
    const { data } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const formattedTime = FormatRefreshTime(new Date())
    const [lastUpdate, setLastUpdate] = useState<string>(formattedTime);

    const fetchData = useCallback(async () => {
        if (!data?.user.idToken) return;
        FetchData({ getItems: GetEmployees, setItems: setEmployees, data, setError, setLoading })
    }, [data?.user.idToken!]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setItemsState = (items: Employee[]) => {
        setEmployees(items);
    }

    const addItem = (product: Employee) => {
        setEmployees((prev) => [...prev, product]);
    };

    const removeItem = (id: string) => {
        setEmployees((prev) => prev.filter((product) => product.id !== id));
    };

    const updateLastUpdate = () => setLastUpdate(FormatRefreshTime(new Date()));

    const getError = () => error;
    const getLoading = () => loading;
    const getLastUpdate = () => lastUpdate;

    return (
        <ContextEmployee.Provider value={{ items, fetchData, setItemsState, addItem, removeItem, updateLastUpdate, getError, getLoading, getLastUpdate }}>
            {children}
        </ContextEmployee.Provider>
    );
};

export const useEmployees = () => {
    const context = useContext(ContextEmployee);
    if (!context) {
        throw new Error('useEmployees must be used within a EmployeesProvider');
    }
    return context;
};
