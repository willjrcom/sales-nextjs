'use client';

import GetProducts from '@/app/api/product/route';
import Product from '@/app/entities/product/product';
import React, { createContext, useContext, ReactNode } from 'react';
import GenericProvider, { ItemsContextProps } from '../props';

const ContextProduct = createContext<ItemsContextProps<Product> | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Product>({ getItems: GetProducts });

    return (
        <ContextProduct.Provider value={values}>
            {children}
        </ContextProduct.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ContextProduct);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
