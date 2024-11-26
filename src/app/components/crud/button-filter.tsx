import FilterForm from "@/app/components/modal/filter";
import { FaFilter } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";

interface FilterButtonProps {
    modalName: string
    children?: React.ReactNode;
}

const ButtonFilter = ({ modalName, children }: FilterButtonProps) => {
    const handleModal = useModal();
    const newEntity = "Filtrar";
    
    return (
        <div>
            <button onClick={() => handleModal.showModal(modalName)} className="flex items-center space-x-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-max">
                <FaFilter />
                <span>{newEntity}</span>
            </button>
        
            <FilterForm show={handleModal.isModalOpen(modalName)} onClose={() => handleModal.hideModal(modalName)}>
                {children}
            </FilterForm>
        </div>
    )
}

export default ButtonFilter