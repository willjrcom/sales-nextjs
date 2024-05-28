import CreateClientForm from "@/app/forms/client/create";
import FilterForm from "@/app/forms/filter";
import Form from "@/app/forms/form";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

interface NewButtonProps {
    name: string;
    href: string;
    children: React.ReactNode;
}

const ButtonPlus = ({ name, href, children }: NewButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const newClient = "Novo " + {name}.name;
    
    return (
        <div>
            <button onClick={handleOpenModal} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaPlus />
                <span>{newClient}</span>
            </button>
        
            <Form title={newClient} show={showModal} onClose={(handleCloseModal)} createHref={href}>
                {children}
            </Form>
        </div>

    )
}

export default ButtonPlus