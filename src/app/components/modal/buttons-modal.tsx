'use client';

import RequestError from "@/app/utils/error";
import { useModal } from "@/app/context/modal/context";
import { useSession } from "next-auth/react";
import { notifyError } from "@/app/utils/notifications";

interface ModalProps<T> {
    item: T;
    name: string;
    onSubmit?: () => void
    deleteItem?: () => void;
    isAddItem?: boolean;
    isRemoveItem?: boolean;
    deleteLabel?: string;
    isPending?: boolean;
}

const ButtonsModal = <T extends { id: string, name?: string }>({ item, name, onSubmit, deleteItem, isAddItem, isRemoveItem, deleteLabel, isPending }: ModalProps<T>) => {
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-" + name + "-" + item.id;

    const onDelete = async () => {
        if (!data) return;
        try {
            if (deleteItem) deleteItem();

            modalHandler.hideModal(modalName)
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || `Erro ao remover ${name}`);
        }
    }

    const ModalDelete = () => {
        return (
            <>
                <div className="text-center mb-4"><h2>Tem certeza que deseja {deleteLabel?.toLowerCase() || 'excluir'} {item.name}?</h2></div>
                <button
                    disabled={isPending}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onDelete}
                >
                    {isPending ? (deleteLabel || 'Excluindo...') : (deleteLabel || 'Excluir')}
                </button>
            </>
        )
    }

    const onClose = () => {
        modalHandler.hideModal(modalName)
    }

    const onCloseModal = () => {
        const title = (deleteLabel || (isRemoveItem ? 'Remover' : 'Excluir')) + ' ' + item.name;
        modalHandler.showModal(modalName, title, <ModalDelete />, "md", onClose)
    }

    let buttonName = item.id !== '' ? 'Atualizar' : 'Cadastrar'
    buttonName = isAddItem ? 'Adicionar' : buttonName

    const pendingLabel = buttonName === 'Cadastrar' ? 'Cadastrando...' : (buttonName === 'Atualizar' ? 'Atualizando...' : 'Adicionando...')

    return (
        <div>
            <div className="flex items-center justify-between mt-6">
                {onSubmit && (
                    <button
                        onClick={onSubmit}
                        disabled={isPending}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                    >
                        {isPending ? pendingLabel : buttonName}
                    </button>
                )}
                {!onSubmit && <div></div>}

                {item.id !== '' && deleteItem && (
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={onCloseModal}
                        disabled={isPending}
                    >
                        {deleteLabel || (isRemoveItem ? 'Remover' : 'Excluir')}
                    </button>
                )}
            </div>
        </div>
    )
}

export default ButtonsModal