import GetCategories from '@/app/api/category/route';
import Category from '@/app/entities/category/category';
import React, { createContext, useContext, ReactNode} from 'react';
import GenericProvider, { ItemsContextProps } from '../props';

const ContextCategory = createContext<ItemsContextProps<Category> | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Category>({ getItems: GetCategories });

    return (
        <ContextCategory.Provider value={values}>
            {children}
        </ContextCategory.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(ContextCategory);
    if (!context) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};
