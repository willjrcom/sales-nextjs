'use client';

import { FaTrash } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    modalName: string
    name: string;
    children: React.ReactNode;
    onCloseModal?: () => void
}

const ButtonDelete = ({ size = 'md', modalName, name, children, onCloseModal }: NewButtonProps) => {
    const modalHandler = useModal()
    const deleteButton = "Excluir " + name;

    const onClose = () => {
        if (onCloseModal) onCloseModal();
        modalHandler.hideModal(modalName)
    }

    return (
        <button onClick={() => modalHandler.showModal(modalName, deleteButton, children, size, onClose)} className="flex items-center space-x-2 p-2 rounded-md w-max">
            <FaTrash />
        </button>
    )
}

export default ButtonDelete