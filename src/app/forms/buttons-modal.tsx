import Link from "next/link"

interface ModalProps {
    isUpdate?: boolean
    onSubmit: () => void   
    onCancel: () => void 
}

const ButtonModal = ({ isUpdate, onSubmit, onCancel }: ModalProps) => {
    return (
        <div className="flex items-center justify-between mt-6">
        <button onClick={onSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
            {isUpdate ? 'Atualizar' : 'Cadastrar'}
        </button>

        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onCancel}>
            Cancelar
        </button>
    </div>
    )
}

export default ButtonModal