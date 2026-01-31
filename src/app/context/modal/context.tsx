'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import React, { createContext, useContext, ReactNode, useState } from "react";

// Interface para as propriedades de um modal
interface ModalData {
    title: string;
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    onClose?: () => void;
}

interface ModalContextProps {
    modals: Record<string, ModalData>;
    showModal: (
        modalName: string,
        title: string,
        content: ReactNode,
        size?: "sm" | "md" | "lg" | "xl" | "2xl",
        onClose?: () => void
    ) => void;
    hideModal: (modalName: string) => void;
    isModalOpen: (modalName: string) => boolean;
}

const ContextModal = createContext<ModalContextProps | undefined>(undefined);

const sizeClasses = {
    sm: 'w-[95vw] md:max-w-[25vw] h-auto',
    md: 'w-[95vw] md:max-w-[50vw] h-auto',
    lg: 'w-[95vw] md:max-w-[75vw] h-[75vh]',
    xl: 'w-[95vw] md:max-w-[90vw] h-[90vh]',
    '2xl': 'w-[95vw] md:max-w-[95vw] h-[95vh]',
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<Record<string, ModalData>>({});

    const showModal = (
        modalName: string,
        title: string,
        content: ReactNode,
        size: "sm" | "md" | "lg" | "xl" | "2xl" = "md",
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

    return (
        <ContextModal.Provider value={{ modals, showModal, hideModal, isModalOpen }}>
            {children}

            {/* Renderizar modais dinâmicos usando shadcn/ui Dialog */}
            {Object.entries(modals).map(([modalName, { title, content, size = 'md', onClose }]) => (
                <Dialog
                    key={modalName}
                    open={true}
                    onOpenChange={(open: boolean) => !open && hideModal(modalName)}
                >
                    <DialogContent
                        className={cn(
                            'max-h-[90vh] overflow-y-auto bg-white p-5 rounded-lg shadow-lg',
                            sizeClasses[size]
                        )}
                    >
                        <DialogHeader className="mb-4">
                            <DialogTitle>{title}</DialogTitle>
                        </DialogHeader>
                        <div>
                            <hr className="mb-4" />
                            {content}
                        </div>
                    </DialogContent>
                </Dialog>
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
