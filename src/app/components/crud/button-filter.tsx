import FilterForm from "@/app/forms/filter";
import { useState } from "react";
import { FaFilter } from "react-icons/fa";

interface FilterButtonProps {
    name: string;
    children?: React.ReactNode;
}

const ButtonFilter = ({ name, children }: FilterButtonProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const newEntity = "Filtrar";
    
    return (
        <div>
            <button onClick={handleOpenModal} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaFilter />
                <span>{newEntity}</span>
            </button>
        
            <FilterForm title={name} show={showModal} onClose={(handleCloseModal)}>
                {children}
            </FilterForm>
        </div>
    )
}

export default ButtonFilter