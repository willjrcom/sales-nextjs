import Form from "@/app/forms/form";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";

interface NewButtonProps {
    name: string;
    children: React.ReactNode;
    showModal: boolean
    setModal: (value: boolean) => void
}

const ButtonPlus = ({ name, children, showModal, setModal }: NewButtonProps) => {

    const newClient = "Novo " + { name }.name;

    return (
        <div>
            <button onClick={() => setModal(true)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newClient}</span>
            </button>

            <Form title={newClient} show={showModal} onClose={(() => setModal(false))}>
                {children}
            </Form>
        </div>

    )
}

export default ButtonPlus