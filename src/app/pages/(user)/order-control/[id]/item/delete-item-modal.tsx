import RequestError from "@/app/utils/error";
import DeleteItem from "@/app/api/item/delete/item";
import { useModal } from "@/app/context/modal/context";
import Item from "@/app/entities/order/item";
import { useSession } from "next-auth/react";
import { notifyError } from "@/app/utils/notifications";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteItemModalProps {
    item: Item;
    itemsCount?: number;
}

const DeleteItemModal = ({ item, itemsCount }: DeleteItemModalProps) => {
    const queryClient = useQueryClient();
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-item-" + item.id;

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeleteItem(item.id, data)

            if (itemsCount === 1) {
                // Se era o último item, limpa o cache
                queryClient.setQueryData(['group-item', 'current'], null);
            } else {
                // Senão, apenas invalida para refetch
                queryClient.invalidateQueries({ queryKey: ['group-item', 'current'] });
            }

            modalHandler.hideModal(modalName)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao excluir item")
        }
    }

    return (
        <>
            <div className="text-center mb-4"><h2>Tem certeza que deseja excluir {item.name}?</h2></div>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onDelete}>Excluir</button>
        </>
    )
};

export default DeleteItemModal