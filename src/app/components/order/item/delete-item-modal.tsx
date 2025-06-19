import RequestError from "@/app/utils/error";
import DeleteItem from "@/app/api/item/delete/item";
import { useGroupItem } from "@/app/context/group-item/context";
import { useModal } from "@/app/context/modal/context";
import Item from "@/app/entities/order/item";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { notifyError } from "@/app/utils/notifications";

interface DeleteItemModalProps {
    item: Item;
}

const DeleteItemModal = ({ item }: DeleteItemModalProps) => {
    const contextGroupItem = useGroupItem();
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-item-" + item.id;

    const onDelete = async () => {
        if (!data || !contextGroupItem.groupItem) return;
        try {
            await DeleteItem(item.id, data)

            if (contextGroupItem.groupItem.items.length === 1 && contextGroupItem.groupItem.items[0].id == item.id) {
                contextGroupItem.resetGroupItem()
            } else {
                contextGroupItem.fetchData(contextGroupItem.groupItem.id)
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