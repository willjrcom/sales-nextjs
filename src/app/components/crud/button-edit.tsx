import CreateClientForm from "@/app/forms/client/create";
import FilterForm from "@/app/forms/filter";
import Form from "@/app/forms/form";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";

interface NewButtonProps {
    name: string;
    href: string;
    children: React.ReactNode;
}

const ButtonEdit = ({ name, href, children }: NewButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const newClient = "Editar " + {name}.name;
    
    return (
        <div>
            <button onClick={handleOpenModal} className="flex items-center space-x-2 p-2 rounded-md w-max">
                <FaEdit />
            </button>
        
            <Form title={newClient} show={showModal} onClose={(handleCloseModal)} createHref={href}>
                {children}
            </Form>
        </div>

    )
}

export default ButtonEdit