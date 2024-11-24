import Modal from "@/app/forms/form";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface NewButtonProps {
    name: string;
    children: React.ReactNode;
}

const ButtonPlus = ({ name, children }: NewButtonProps) => {
    const modalHandler = useModal();
    const newButton = "Novo " + { name }.name;

    return (
        <div>
            <button onClick={() => modalHandler.setShowModal(true)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newButton}</span>
            </button>

            <Modal title={newButton} show={modalHandler.showModal}>
                {children}
            </Modal>
        </div>

    )
}

export default ButtonPlus