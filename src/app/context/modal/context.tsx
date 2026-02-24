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
    const showModal = React.useCallback((
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
    }, []);

    const hideModal = React.useCallback((modalName: string) => {
        setModals((prev) => {
            if (!prev[modalName]) return prev;

            const modalData = prev[modalName];
            const { [modalName]: _, ...rest } = prev;

            if (modalData.onClose) {
                // Executar onClose fora do ciclo de renderização atual
                setTimeout(() => modalData.onClose?.(), 0);
            }

            return rest;
        });
    }, []);

    const isModalOpen = React.useCallback((modalName: string) => !!modals[modalName], [modals]);

    const contextValue = React.useMemo(() => ({ modals, showModal, hideModal, isModalOpen }), [modals, showModal, hideModal, isModalOpen]);

    return (
        <ContextModal.Provider value={contextValue}>
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
                            'max-h-[95vh] overflow-y-auto p-0 rounded-xl shadow-2xl border-none outline-none',
                            title ? 'bg-white' : 'bg-transparent',
                            sizeClasses[size]
                        )}
                    >
                        {title && (
                            <div className="p-5 pb-0">
                                <DialogHeader className="mb-4">
                                    <DialogTitle>{title}</DialogTitle>
                                </DialogHeader>
                                <hr className="mb-4" />
                            </div>
                        )}
                        <div className={cn(title ? "p-5 pt-0" : "h-full")}>
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
