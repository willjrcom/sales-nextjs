import { useState } from "react";
import Modal from "./modal";
import RequestError from "@/app/api/error";
import { useModal } from "@/app/context/modal/context";
import { useSession } from "next-auth/react";

interface ModalProps<T> {
    item: T;
    name: string;
    onSubmit: () => void   
    deleteItem?: () => void;
}

const ButtonsModal = <T extends { id: string, name?: string }>({ item, name, onSubmit, deleteItem }: ModalProps<T>) => {
    const [error, setError] = useState<RequestError | null>(null);
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-" + name + "-" + item.id;

    const onDelete = async () => {
        if (!data) return;
        try {
            if (deleteItem) deleteItem();
            setError(null)

            modalHandler.hideModal(modalName)
        } catch (error) {
            setError(error as RequestError)
        }
    }
    
    return (
        <div>
            <div className="flex items-center justify-between mt-6">
            <button onClick={onSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                {item.id !== '' ? 'Atualizar' : 'Cadastrar'}
            </button>

            {item.id !== '' && onDelete &&
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => modalHandler.showModal(modalName)} >
                Excluir
                
                <Modal title={"Excluir " + name} show={modalHandler.isModalOpen(modalName)} onClose={() => modalHandler.hideModal(modalName)}>
                    <div className="text-center mb-4"><h2>Tem certeza que deseja excluir {item.name}?</h2></div>
                    {error && <p className="text-red-500 mb-4">{error.message}</p>}
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onDelete}>Excluir</button>
                </Modal>
            </button>
            }
        </div>
    </div>
    )
}

export default ButtonsModal