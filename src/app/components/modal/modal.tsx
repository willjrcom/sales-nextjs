'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import React from 'react';

interface ModalProps {
    title: string;
    show: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onClose?: () => void;
    withoutBackground?: boolean;
    children: React.ReactNode;
}

const Modal = ({ title, show, size = 'md', onClose, children }: ModalProps) => {

    const sizeClasses = {
        sm: 'max-w-[25vw] h-auto',
        md: 'max-w-[50vw] h-auto',
        lg: 'max-w-[75vw] h-[75vh]',
        xl: 'max-w-[90vw] h-[90vh]',
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && onClose) {
            onClose();
        }
    }

    return (
        <Dialog open={show} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    "max-h-[90vh] overflow-y-auto bg-white p-5 rounded-lg shadow-lg", // Replica estilos do CSS antigo
                    sizeClasses[size]
                )}
            >
                <DialogHeader className="mb-4">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div>
                    <hr className="mb-4" />
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default Modal;
