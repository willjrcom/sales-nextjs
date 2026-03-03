import React from "react";
import { Plus } from "lucide-react";
import { useModal } from "@/app/context/modal/context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NewButtonProps {
    icon?: any;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'default';
    modalName: string;
    title?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'emerald' | 'amber' | 'rose' | 'indigo';
    onCloseModal?: () => void;
    children: React.ReactNode;
    isDisabled?: boolean;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const colorMap = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-emerald-600 hover:bg-emerald-700 text-white",
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
    red: "bg-rose-600 hover:bg-rose-700 text-white",
    rose: "bg-rose-600 hover:bg-rose-700 text-white",
    yellow: "bg-amber-600 hover:bg-amber-700 text-white",
    amber: "bg-amber-600 hover:bg-amber-700 text-white",
    purple: "bg-indigo-600 hover:bg-indigo-700 text-white",
    indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
    gray: "bg-gray-600 hover:bg-gray-700 text-white",
};

const ButtonIconText = ({
    icon: Icon = Plus,
    size = 'md',
    modalName,
    title = "",
    color = 'blue',
    onCloseModal,
    children,
    isDisabled,
    className,
    variant = "default"
}: NewButtonProps) => {
    const modalHandler = useModal();

    const onClose = () => {
        if (onCloseModal) onCloseModal();
    }

    const buttonSize = size === 'md' ? 'default' : (size === 'xl' ? 'lg' : size) as any;

    return (
        <Button
            disabled={isDisabled}
            variant={variant}
            size={buttonSize}
            onClick={() => modalHandler.showModal(modalName, title, children, size as any, onClose)}
            className={cn(
                "font-black uppercase tracking-widest gap-2 transition-all active:scale-95 shadow-sm",
                variant === "default" && colorMap[color],
                className
            )}
        >
            <Icon className="w-4 h-4" />
            {title && <span>{title}</span>}
        </Button>
    )
}

export default ButtonIconText;