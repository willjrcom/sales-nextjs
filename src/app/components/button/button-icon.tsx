'use client';

import { FaEdit } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import { IconType } from "react-icons";

interface NewButtonProps {
    icon?: IconType;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    modalName: string;
    title?: string;
    onCloseModal?: () => void;
    children: React.ReactNode;
}

const ButtonIcon = ({ icon: Icon = FaEdit, size = 'md', modalName, title = "", onCloseModal, children }: NewButtonProps) => {
    const modalHandler = useModal()

    const onClose = () => {
        if (onCloseModal) onCloseModal();
        modalHandler.hideModal(modalName)
    }

    return (
        <button onClick={() => modalHandler.showModal(modalName, title, children, size, onClose)} className="flex items-center space-x-2 p-2 rounded-md w-max">
            <Icon />
        </button>
    )
}

export default ButtonIcon