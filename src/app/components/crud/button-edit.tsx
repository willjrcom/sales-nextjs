'use client';

import Modal from "@/app/forms/form";
import { FaEdit } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    name: string;
    children: React.ReactNode;
}

const ButtonEdit = ({ name, children }: NewButtonProps) => {
    const modalHandler = useModal()

    const editButton = "Editar " + {name}.name;
    
    return (
        <div>
            <button onClick={() => modalHandler.setShowModal(true)} className="flex items-center space-x-2 p-2 rounded-md w-max">
                <FaEdit />
            </button>
        
            <Modal title={editButton} show={modalHandler.showModal}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonEdit