import Modal from "@/app/components/modal/modal";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    modalName: string
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl'
    onCloseModal?: () => void;
    children: React.ReactNode;
}

const ButtonPlus = ({ modalName, name, size = 'sm', onCloseModal, children }: NewButtonProps) => {
    const modalHandler = useModal();

    const onClose = () => {
        if (onCloseModal) onCloseModal();
        modalHandler.hideModal(modalName)
    }

    return (
        <div>
            <button onClick={() => modalHandler.showModal(modalName)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                {name && <span>{name}</span>}
            </button>

            <Modal title={name} size={size} show={modalHandler.isModalOpen(modalName)} onClose={onClose}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonPlus