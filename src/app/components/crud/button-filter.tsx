import FilterForm from "@/app/forms/filter";
import { FaFilter } from "react-icons/fa";
import ModalHandler from "../modal/modal";

interface FilterButtonProps {
    children?: React.ReactNode;
}

const ButtonFilter = ({ children }: FilterButtonProps) => {
    const handleModal = ModalHandler();
    const newEntity = "Filtrar";
    
    return (
        <div>
            <button onClick={() => handleModal.setShowModal(true)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaFilter />
                <span>{newEntity}</span>
            </button>
        
            <FilterForm show={handleModal.showModal} onClose={() => handleModal.setShowModal(false)}>
                {children}
            </FilterForm>
        </div>
    )
}

export default ButtonFilter