import RequestError from "@/app/api/error";
import DeleteComplementGroupItem from "@/app/api/group-item/delete/complement/route";
import { useGroupItem } from "@/app/context/group-item/context";
import { useModal } from "@/app/context/modal/context";
import GroupItem from "@/app/entities/order/group-item";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface DeleteComplementItemModalProps {
    item: GroupItem;
}

const DeleteComplementItemModal = ({ item }: DeleteComplementItemModalProps) => {
    const [error, setError] = useState<RequestError | null>(null);
    const contextGroupItem = useGroupItem();
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-complement-item-" + item.id;

    const onDelete = async () => {
        if (!data) return;
        try {
            await DeleteComplementGroupItem(item.id, data)
            setError(null)

            contextGroupItem.fetchData(contextGroupItem.groupItem?.id || "")

            modalHandler.hideModal(modalName)
        } catch (error) {
            setError(error as RequestError)
        }
    }

    return (
        <>
            <div className="text-center mb-4"><h2>Tem certeza que deseja excluir {item.complement_item?.name}?</h2></div>
            {error && <p className="text-red-500 mb-4">{error.message}</p>}
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onDelete}>Excluir</button>
        </>
    )
};

export default DeleteComplementItemModal