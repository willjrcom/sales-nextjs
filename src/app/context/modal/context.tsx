import Modal from "@/app/components/modal/modal";
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";

// Interface para as propriedades de um modal
interface ModalData {
    title: string;
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    onClose?: () => void;
}

interface ModalContextProps {
    modals: Record<string, ModalData>;
    showModal: (
        modalName: string,
        title: string,
        content: ReactNode,
        size?: "sm" | "md" | "lg" | "xl",
        onClose?: () => void
    ) => void;
    hideModal: (modalName: string) => void;
    isModalOpen: (modalName: string) => boolean;
}

const ContextModal = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<Record<string, ModalData>>({});
    const [isClient, setIsClient] = useState(false);

    // Garantir que o componente só renderize após o lado do cliente estar disponível
    useEffect(() => {
        setIsClient(true);
    }, []);

    const showModal = (
        modalName: string,
        title: string,
        content: ReactNode,
        size: "sm" | "md" | "lg" | "xl" = "md",
        onClose?: () => void
    ) => {
        setModals((prev) => ({
            ...prev,
            [modalName]: { title, content, size, onClose },
        }));
    };

    const hideModal = (modalName: string) => {
        const onClose = modals[modalName]?.onClose;

        if (onClose) {
            onClose(); // Executa a função customizada de fechamento, se fornecida
        }

        setModals((prev) => {
            const { [modalName]: _, ...rest } = prev;
            return rest;
        });
    };

    const isModalOpen = (modalName: string) => !!modals[modalName];

    if (!isClient) return null; // Previne erros de hidratação

    return (
        <ContextModal.Provider value={{ modals, showModal, hideModal, isModalOpen }}>
            {children}

            {/* Renderizar modais dinâmicos */}
            {Object.entries(modals).map(([modalName, { title, content, size, onClose }]) => (
                <Modal
                    key={modalName}
                    title={title}
                    show={true}
                    size={size}
                    onClose={onClose} // Garante o fechamento dinâmico
                >
                    {content}
                </Modal>
            ))}
        </ContextModal.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ContextModal);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};
