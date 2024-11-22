'use client';

import Form from "@/app/forms/form";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import ModalHandler from "../modal/modal";

interface NewButtonProps {
    name: string;
    children: React.ReactNode;
}

const ButtonEdit = ({ name, children }: NewButtonProps) => {
    const modalHandler = ModalHandler();

    const editButton = "Editar " + {name}.name;
    
    return (
        <div>
            <button onClick={() => modalHandler.setShowModal(true)} className="flex items-center space-x-2 p-2 rounded-md w-max">
                <FaEdit />
            </button>
        
            <Form title={editButton} show={modalHandler.showModal} onClose={() => modalHandler.setShowModal(false)}>
                {children}
            </Form>
        </div>

    )
}

export default ButtonEdit