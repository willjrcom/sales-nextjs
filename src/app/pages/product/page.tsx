'use client'

import Form from "@/app/forms/form";
import CreateProductForm from "@/app/forms/product/create";
import FilterForm from "@/app/forms/filter";
import CrudLayout from "@/components/crud/layout";
import Menu from "@/components/menu/layout";
import { useState } from "react";
import { FaPlus } from 'react-icons/fa';

interface NewButtonProps {
    name: string;
    href: string;
}

interface FilterButtonProps {
    name: string;
}

const ButtonPlus = ({ name, href }: NewButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const newProduct = "Novo " + {name}.name;
    
    return (
        <div>
            <button onClick={handleOpenModal} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newProduct}</span>
            </button>
        
            <Form title={newProduct} show={showModal} onClose={(handleCloseModal)} createHref={href}>
                <CreateProductForm/>
            </Form>
        </div>

    )
}

const ButtonFilter = ({ name }: FilterButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const newProduct = "Filtrar " + {name}.name;
    
    return (
        <div>
            <button onClick={handleOpenModal} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newProduct}</span>
            </button>
        
            <FilterForm title={name} show={showModal} onClose={(handleCloseModal)}>
                <CreateProductForm/>
            </FilterForm>
        </div>

    )
}

const ListProducts: React.FC = () => {
    return (
        <body>
            <Menu>
                <CrudLayout title="Produtos" filterButtonChildren={<ButtonFilter name="produto" />} plusButtonChildren={<ButtonFilter name="produto" />} tableChildren={<ButtonPlus name="produto" href="/product/new" />}/>
            </Menu>
        </body>
    );
}

export default ListProducts