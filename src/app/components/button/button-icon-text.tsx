import React from "react";
import { FaPlus } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import { IconType } from "react-icons";

interface NewButtonProps {
    icon?: IconType;
    size?: 'sm' | 'md' | 'lg' | 'xl'
    modalName: string
    title?: string;
    color?: string;
    onCloseModal?: () => void;
    children: React.ReactNode;
    isDisabled?: boolean;
}

const ButtonIconText = ({ icon: Icon = FaPlus, size = 'md', modalName, title = "", color = 'blue', onCloseModal, children, isDisabled }: NewButtonProps) => {
    const modalHandler = useModal();

    const onClose = () => {
        if (onCloseModal) onCloseModal();
        modalHandler.hideModal(modalName)
    }

    if (isDisabled) {
        return (
            <button disabled className={`flex items-center space-x-2 p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 w-max`}>
                Indisponível
            </button>
        )
    }
    return (
        <button onClick={() => modalHandler.showModal(modalName, title, children, size, onClose)} className={`flex items-center space-x-2 p-2 bg-${color}-500 text-white rounded-md hover:bg-${color}-600 w-max`}>
            <Icon /> {title && <span>{title}</span>}
        </button>
    )
}

export default ButtonIconText