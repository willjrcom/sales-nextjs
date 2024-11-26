import Modal from "@/app/components/modal/modal";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    modalName: string
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl'
    children: React.ReactNode;
}

const ButtonPlus = ({ modalName, name, size = 'sm', children }: NewButtonProps) => {
    const modalHandler = useModal();
    const newButton = "Novo " + { name }.name;

    return (
        <div>
            <button onClick={() => modalHandler.showModal(modalName)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newButton}</span>
            </button>

            <Modal title={newButton} size={size} show={modalHandler.isModalOpen(modalName)} onClose={() => modalHandler.hideModal(modalName)}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonPlus