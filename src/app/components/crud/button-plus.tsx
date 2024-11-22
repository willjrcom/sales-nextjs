import Form from "@/app/forms/form";
import React from "react";
import { FaPlus } from "react-icons/fa";
import ModalHandler from "../modal/modal";

interface NewButtonProps {
    name: string;
    children: React.ReactNode;
}

const ButtonPlus = ({ name, children }: NewButtonProps) => {
    const modalHandler = ModalHandler();
    const newButton = "Novo " + { name }.name;

    return (
        <div>
            <button onClick={() => modalHandler.setShowModal(true)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newButton}</span>
            </button>

            <Form title={newButton} show={modalHandler.showModal} onClose={(() => modalHandler.setShowModal(false))}>
                {children}
            </Form>
        </div>

    )
}

export default ButtonPlus