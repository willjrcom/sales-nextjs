import React from "react";
import { FaPlus } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import { IconType } from "react-icons";

interface NewButtonProps {
    icon?: IconType;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    modalName: string;
    title?: string;
    color?: string;
    onCloseModal?: () => void;
    children: React.ReactNode;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const ButtonIconTextFloat = ({
    icon: Icon = FaPlus,
    size = 'md',
    modalName,
    title = "",
    color = 'blue',
    onCloseModal,
    children,
    position = 'bottom-left',
}: NewButtonProps) => {
    const modalHandler = useModal();

    const onClose = () => {
        if (onCloseModal) onCloseModal();
        modalHandler.hideModal(modalName);
    };

    // Gerar classes de Tailwind para o posicionamento
    let positionClasses = '';
    switch (position) {
        case 'top-left':
            positionClasses = 'top-5 left-5';
            break;
        case 'top-right':
            positionClasses = 'top-5 right-5';
            break;
        case 'bottom-left':
            positionClasses = 'bottom-5 left-20';
            break;
        case 'bottom-right':
            positionClasses = 'bottom-5 right-5';
            break;
    }

    return (
        <button
            onClick={() => modalHandler.showModal(modalName, title, children, size, onClose)}
            className={`fixed ${positionClasses} flex items-center justify-center space-x-2 p-4 bg-${color}-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-${color}-600 w-max z-50`}
        >
            <Icon className="text-lg" /> {/* Ajustando o tamanho do ícone */}
            {title && <span className="text-sm">{title}</span>}
        </button>
    );
};

export default ButtonIconTextFloat;