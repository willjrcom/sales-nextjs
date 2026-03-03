import { useState } from "react";
import RequestError from "@/app/utils/error";
import DeleteItem from "@/app/api/item/delete/item";
import { useModal } from "@/app/context/modal/context";
import Item from "@/app/entities/order/item";
import { useSession } from "next-auth/react";
import { notifyError } from "@/app/utils/notifications";
import { useQueryClient } from "@tanstack/react-query";
import GetGroupItemByID from "@/app/api/group-item/[id]/group-item";

interface DeleteItemModalProps {
    item: Item;
}

const DeleteItemModal = ({ item }: DeleteItemModalProps) => {
    const queryClient = useQueryClient();
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-item-" + item.id;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onDelete = async () => {
        if (!data) return;
        setIsSubmitting(true);
        try {
            const groupItemDeleted = await DeleteItem(item.id, data);

            if (groupItemDeleted) {
                // 👇 Se esse era o último item, o groupItem não deve mais existir
                queryClient.setQueryData(['group-item', 'current'], null);
            } else {
                // Só atualiza normalmente se ainda existir grupo
                const updatedGroupItem = await GetGroupItemByID(item.group_item_id, data);
                queryClient.setQueryData(['group-item', 'current'], updatedGroupItem);
            }

            modalHandler.hideModal(modalName);
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao excluir item");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div className="text-center mb-4"><h2>Tem certeza que deseja excluir {item.name}?</h2></div>
            <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                onClick={onDelete}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Excluindo..." : "Excluir"}
            </button>
        </>
    )
};

export default DeleteItemModal