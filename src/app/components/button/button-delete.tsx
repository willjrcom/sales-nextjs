'use client';

import { Trash2 } from "lucide-react";
import { useModal } from "@/app/context/modal/context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewButtonProps {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
    modalName: string;
    additionalModals?: string[];
    name: string;
    children: React.ReactNode;
    onCloseModal?: () => void;
    className?: string;
}

const ButtonDelete = ({ size = 'icon', modalName, additionalModals, name, children, onCloseModal, className }: NewButtonProps) => {
    const modalHandler = useModal()
    const deleteButton = "Excluir " + name;

    const onClose = () => {
        if (onCloseModal) onCloseModal();
        additionalModals?.forEach(modal => modalHandler.hideModal(modal))
    }

    return (
        <Button
            variant="ghost"
            size={size === 'icon' ? 'icon' : 'sm'}
            onClick={() => modalHandler.showModal(modalName, deleteButton, children, size as any, onClose)}
            className={cn("text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95", className)}
        >
            <Trash2 className="w-5 h-5" />
        </Button>
    )
}

export default ButtonDelete;