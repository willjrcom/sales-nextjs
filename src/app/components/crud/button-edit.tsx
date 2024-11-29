'use client';

import Modal from "@/app/components/modal/modal";
import { FaEdit } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    modalName: string
    name: string;
    onCloseModal?: () => void
    children: React.ReactNode;
}

const ButtonEdit = ({ size = 'sm', modalName, name, onCloseModal, children }: NewButtonProps) => {
    const modalHandler = useModal()

    const editButton = "Editar " + name;
    
    const onClose = () => {
        if (onCloseModal) onCloseModal();
        modalHandler.hideModal(modalName)
    }

    return (
        <div>
            <button onClick={() => modalHandler.showModal(modalName)} className="flex items-center space-x-2 p-2 rounded-md w-max">
                <FaEdit />
            </button>
        
            <Modal title={editButton} size={size} show={modalHandler.isModalOpen(modalName)} onClose={onClose}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonEdit