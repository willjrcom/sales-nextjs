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
        <div>
            <button onClick={() => modalHandler.showModal(modalName)} className="flex items-center space-x-2 p-2 rounded-md w-max">
                <FaTrash />
            </button>
        
            <Modal title={deleteButton} size={size} show={modalHandler.isModalOpen(modalName)} onClose={() => modalHandler.hideModal(modalName)}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonDelete