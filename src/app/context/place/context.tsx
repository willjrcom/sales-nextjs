import GetPlaces from '@/app/api/place/route';
import Place from '@/app/entities/place/place';
import React, { createContext, useContext, ReactNode} from 'react';
import GenericProvider, { ItemsContextProps } from '../props';

const ContextPlace = createContext<ItemsContextProps<Place> | undefined>(undefined);

export const PlaceProvider = ({ children }: { children: ReactNode }) => {
    const values = GenericProvider<Place>({ getItems: GetPlaces });

    return (
        <ContextPlace.Provider value={values}>
            {children}
        </ContextPlace.Provider>
    );
};

export const usePlaces = () => {
    const context = useContext(ContextPlace);
    if (!context) {
        throw new Error('useItems must be used within a PlaceProvider');
    }
    return context;
};
