'use client';

import { Edit, LucideIcon } from "lucide-react";
import { useModal } from "@/app/context/modal/context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewButtonProps {
    icon?: any;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'icon';
    modalName: string;
    title?: string;
    onCloseModal?: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const ButtonIcon = ({
    icon: Icon = Edit,
    size = 'icon',
    modalName,
    title = "",
    onCloseModal,
    children,
    className,
    variant = "ghost"
}: NewButtonProps) => {
    const modalHandler = useModal()

    const onClose = () => {
        if (onCloseModal) onCloseModal();
    }

    return (
        <Button
            variant={variant}
            size={size === 'icon' ? 'icon' : 'sm'}
            onClick={() => modalHandler.showModal(modalName, title, children, size as any, onClose)}
            className={cn("text-gray-400 hover:text-blue-600 rounded-xl transition-all active:scale-95", className)}
        >
            <Icon className="w-5 h-5" />
        </Button>
    )
}

export default ButtonIcon;