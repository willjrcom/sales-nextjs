import RequestError from "@/app/utils/error";
import DeleteComplementGroupItem from "@/app/api/group-item/delete/complement/group-item";
import { useModal } from "@/app/context/modal/context";
import GroupItem from "@/app/entities/order/group-item";
import { useSession } from "next-auth/react";
import { notifyError } from "@/app/utils/notifications";
import { useQueryClient } from "@tanstack/react-query";

const DeleteComplementItemModal = () => {
    const queryClient = useQueryClient();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);
    const modalHandler = useModal();
    const { data } = useSession();
    const modalName = "delete-complement-item-" + groupItem?.id;

    const onDelete = async () => {
        if (!data || !groupItem?.id) return;
        try {
            await DeleteComplementGroupItem(groupItem.id, data)

            queryClient.invalidateQueries({ queryKey: ['group-item', 'current'] });

            modalHandler.hideModal(modalName)
        } catch (error: RequestError | any) {
            notifyError(error.message || "Erro ao excluir complemento")
        }
    }

    return (
        <>
            <div className="text-center mb-4"><h2>Tem certeza que deseja excluir {groupItem?.complement_item?.name}?</h2></div>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={onDelete}>Excluir</button>
        </>
    )
};

export default DeleteComplementItemModal