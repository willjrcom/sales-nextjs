import Modal from "@/app/forms/form";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    modalName: string
    name: string;
    children: React.ReactNode;
}

const ButtonNewItem = ({ modalName, name, children }: NewButtonProps) => {
    const modalHandler = useModal();
    const newButton = "Novo " + { name }.name;

    return (
        <div>
            <button onClick={() => modalHandler.showModal(modalName)} className="flex items-center space-x-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newButton}</span>
            </button>

            <Modal title={newButton} show={modalHandler.isModalOpen(modalName)}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonNewItem