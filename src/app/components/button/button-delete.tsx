'use client';

import Modal from "@/app/components/modal/modal";
import { FaTrash } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    modalName: string
    name: string;
    children: React.ReactNode;
}

const ButtonDelete = ({ size = 'md', modalName, name, children }: NewButtonProps) => {
    const modalHandler = useModal()
    const deleteButton = "Excluir " + name;

    return (
        <button onClick={() => modalHandler.showModal(modalName, deleteButton, children, size)} className="flex items-center space-x-2 p-2 rounded-md w-max">
            <FaTrash />
        </button>
    )
}

export default ButtonDelete