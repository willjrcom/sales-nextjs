import RequestError from "@/app/api/error";
import DeleteItem from "@/app/api/item/delete/route";
import { useCurrentOrder } from "@/app/context/current-order/context";
import { useGroupItem } from "@/app/context/group-item/context";
import { useModal } from "@/app/context/modal/context";
import GroupItem from "@/app/entities/order/group-item";
import Item from "@/app/entities/order/item";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface DeleteItemModalProps {
    item: Item;
}

const DeleteItemModal = ({ item }: DeleteItemModalProps) => {
    const [error, setError] = useState<RequestError | null>(null);
    const contextGroupItem = useGroupItem();
    const contextCurrentOrder = useCurrentOrder();
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-item-" + item.id;

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeleteItem(item.id, data)
            setError(null)

            if (contextGroupItem.groupItem?.items.length === 1 && contextGroupItem.groupItem.items[0].id == item.id) {
                contextCurrentOrder.removeGroupItem(contextGroupItem.groupItem)
            }
            contextGroupItem.removeItem(item.id)

            modalHandler.hideModal(modalName)
        } catch (error) {
            setError(error as RequestError)
        }
    }

    return (
        <>
            <div className="text-center mb-4"><h2>Tem certeza que deseja excluir {item.name}?</h2></div>
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onDelete}>Excluir</button>
        </>
    )
};

export default DeleteItemModal