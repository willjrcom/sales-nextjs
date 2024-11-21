interface ModalProps {
    isUpdate?: boolean
    onSubmit: () => void   
    onDelete: () => void
    onCancel: () => void 
}

const ButtonsModal = ({ isUpdate, onSubmit, onDelete, onCancel }: ModalProps) => {
    return (
        <div>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onDelete}>
                Excluir cadastro
            </button>

            <div className="flex items-center justify-between mt-6">
            <button onClick={onSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                {isUpdate ? 'Atualizar' : 'Cadastrar'}
            </button>

            <button className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onCancel}>
                Cancelar
            </button>
        </div>
    </div>
    )
}

export default ButtonsModal