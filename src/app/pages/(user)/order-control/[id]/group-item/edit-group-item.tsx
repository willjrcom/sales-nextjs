import { useSession } from 'next-auth/react';
import CancelGroupItem from '@/app/api/group-item/status/group-item-cancel';
import { useMemo } from "react";
import { notifyError, notifySuccess } from '@/app/utils/notifications';
import ItemCard from "../item/item-card";
import GroupItemForm from "@/app/forms/group-item/form";
import StatusComponent from "../../../../../components/button/show-status";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import ListComplementItems from "./list-complement-items";
import ComplementItemCard from "./complement-item-card";
import Decimal from "decimal.js";
import { FaTimes } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import ButtonIconText from "../../../../../components/button/button-icon-text";
import { useQueryClient } from '@tanstack/react-query';
import GroupItem from "@/app/entities/order/group-item";

const EditGroupItem = () => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const modalHandler = useModal();
    const groupItem = queryClient.getQueryData<GroupItem | null>(['group-item', 'current']);

    const complementItem = useMemo(() => groupItem?.complement_item, [groupItem?.complement_item]);
    const containItems = useMemo(() => groupItem?.items && groupItem?.items.length > 0, [groupItem?.items]);
    const isGroupItemStaging = useMemo(() => groupItem?.status === "Staging", [groupItem?.status]);

    const cancelGroupItem = async () => {
        if (!session || !groupItem) return;
        try {
            await CancelGroupItem(groupItem.id, "cancelado pelo usuario", session);
            notifySuccess("Item cancelado com sucesso!");

            queryClient.invalidateQueries({ queryKey: ['group-item', 'current'] });
            modalHandler.hideModal("cancel-group-item-" + groupItem.id);
        } catch (error: any) {
            notifyError(error.message || 'Erro ao cancelar grupo de itens');
        }
    }

    return (
        <div className="p-4 bg-white rounded-l-md rounded-r-md text-black min-w-full h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Produtos selecionados</h2>
                {groupItem?.status && <StatusComponent status={groupItem.status} />}
            </div>

            <hr className="my-4" />
            {/* Produto Selecionado */}
            <div className="space-y-2">
                {(!groupItem || groupItem?.items?.length === 0) && <p>Nenhum produto selecionado</p>}
                {groupItem?.items.sort((a, b) => a.id.localeCompare(b.id))?.map((item) => (
                    <ItemCard item={item} key={item.id} />
                ))}
            </div>

            {/* Adicionar complemento */}

            {containItems && (
                <>
                    <hr className="my-4" />
                    <p className="text-lg font-semibold">Complemento</p>
                </>
            )}

            {containItems && !complementItem && isGroupItemStaging && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="default" className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-purple-600">
                            <FaPlus className="h-4 w-4" />
                            Adicionar complemento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                        <DialogHeader>
                            <DialogTitle>Adicionar complemento</DialogTitle>
                        </DialogHeader>
                        <ListComplementItems />
                        <DialogClose asChild>
                            <Button variant="outline" className="mt-4 w-full">Fechar</Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            )}

            {containItems && complementItem &&
                <ComplementItemCard />
            }

            <hr className="my-4" />
            <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total:</p>
                <p className="text-xl font-bold">R$ {new Decimal(groupItem?.total_price || "0").toFixed(2)}</p>
            </div>

            <hr className="my-4" />
            {groupItem?.status === "Staging" && (
                <GroupItemForm item={groupItem} />
            )}
            {/* Botão para cancelar grupo de itens se não estiver em Staging */}
            {groupItem && groupItem.status !== "Staging" && groupItem.status !== "Canceled" && (
                <div className="mt-4">
                    <ButtonIconText modalName={"cancel-group-item-" + groupItem.id} title="Cancelar item" size="md" color="red" icon={FaTimes}>
                        <p className="mb-2">tem certeza que deseja cancelar o item?</p>
                        <button
                            onClick={cancelGroupItem}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                        >
                            Confirmar
                        </button>
                    </ButtonIconText>
                </div>
            )}
        </div>
    );
};

export default EditGroupItem;