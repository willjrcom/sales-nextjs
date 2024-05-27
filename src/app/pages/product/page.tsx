'use client'

import CreateProductForm from "@/app/forms/product/modal";
import CrudLayout from "@/components/crud/layout";
import Menu from "@/components/menu/layout";
import { useState } from "react";
import { FaPlus } from 'react-icons/fa';

interface NewButtonProps {
    name: string;
    href: string;
}

const ButtonPlus = ({ name, href }: NewButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        console.log("teste");
        setShowModal(true);
    };

    const handleCloseModal = () => {
        console.log("Fechar modal");
        setShowModal(false);
    };

    return (
        <div>
            <button onClick={handleOpenModal} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>New {name}</span>
            </button>

            <CreateProductForm show={showModal} onClose={(handleCloseModal)}>
                <h1>teste</h1>
            </CreateProductForm>
        </div>

    )
}

const ListProducts: React.FC = () => {
    return (
        <body>
            <Menu>
                <ButtonPlus name="product" href="/product/new" />
            </Menu>
        </body>
    );
}

export default ListProducts