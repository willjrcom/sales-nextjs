'use client';

import Modal from "@/app/components/modal/modal";
import { FaEdit } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    modalName: string
    name: string;
    children: React.ReactNode;
}

const ButtonEdit = ({ modalName, name, children }: NewButtonProps) => {
    const modalHandler = useModal()

    const editButton = "Editar " + {name}.name;
    
    return (
        <div>
            <button onClick={() => modalHandler.showModal(modalName)} className="flex items-center space-x-2 p-2 rounded-md w-max">
                <FaEdit />
            </button>
        
            <Modal title={editButton} show={modalHandler.isModalOpen(modalName)} onClose={() => modalHandler.hideModal(modalName)}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonEdit