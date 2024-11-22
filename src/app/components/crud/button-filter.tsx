import FilterForm from "@/app/forms/filter";
import { FaFilter } from "react-icons/fa";

interface FilterButtonProps {
    name: string;
    children?: React.ReactNode;
    showModal: boolean;
    setShowModal: (value: boolean) => void
}

const ButtonFilter = ({ name, children, showModal, setShowModal }: FilterButtonProps) => {
    const newEntity = "Filtrar";
    
    return (
        <div>
            <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaFilter />
                <span>{newEntity}</span>
            </button>
        
            <FilterForm title={name} show={showModal} onClose={() => setShowModal(false)}>
                {children}
            </FilterForm>
        </div>
    )
}

export default ButtonFilter