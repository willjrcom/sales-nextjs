import GetEmployees from '@/app/api/employee/route';
import React, { createContext, useContext, ReactNode } from 'react';
import GenericProvider, { ItemContextProps } from '../props';
import Employee from '@/app/entities/employee/employee';

const ContextEmployee = createContext<ItemContextProps<Employee> | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Employee>({ getItems: GetEmployees });

    return (
        <ContextEmployee.Provider value={values}>
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
