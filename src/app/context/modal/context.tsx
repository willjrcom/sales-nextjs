import React, { createContext, useContext, ReactNode, useState } from 'react';

interface ModalContextProps {
    modals: Record<string, boolean>;
    showModal: (modalName: string) => void;
    hideModal: (modalName: string) => void;
    isModalOpen: (modalName: string) => boolean;
}

const ContextModal = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<Record<string, boolean>>({});

    const showModal = (modalName: string) => {
        setModals((prev) => ({ ...prev, [modalName]: true }));
    };

    const hideModal = (modalName: string) => {
        setModals((prev) => ({ ...prev, [modalName]: false }));
    };

    const isModalOpen = (modalName: string) => {
        return !!modals[modalName];
    };

    return (
        <ContextModal.Provider value={{ modals, showModal, hideModal, isModalOpen }}>
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
