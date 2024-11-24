import React, { createContext, useContext, ReactNode, useState } from 'react';

interface ModalContextProps {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
}

const ContextModal = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [showModal, setShowModal] = useState(false);
    
    return (
        <ContextModal.Provider value={{showModal, setShowModal}}>
            {children}
        </ContextModal.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ContextModal);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
