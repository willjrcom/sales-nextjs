"use client";

import { useGroupItem } from "@/app/context/group-item/context";
import { useSession } from 'next-auth/react';
import CancelGroupItem from '@/app/api/group-item/status/group-item-cancel';
import { useEffect, useState } from "react";
import { notifyError, notifySuccess } from '@/app/utils/notifications';
import ItemCard from "../item/card-item";
import GroupItem from "@/app/entities/order/group-item";
import GroupItemForm from "@/app/forms/group-item/form";
import StatusComponent from "../../button/show-status";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import ComplementItemList from "./list-complement-item";
import ComplementItemCard from "./complement-item";
import Item from "@/app/entities/order/item";
import { CartToAdd } from "../cart/cart-to-add";
import Decimal from "decimal.js";
import { FaTimes } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import ButtonIconText from "../../button/button-icon-text";

export default function EditGroupItem() {
    const contextGroupItem = useGroupItem();

    if (!contextGroupItem.groupItem || contextGroupItem.groupItem?.status === "Staging") {
        return (
            <div>
                <CartToAdd />
            </div>
        );
    }

    return (
        <GroupItemCard />
    );
}

const GroupItemCard = () => {
    const contextGroupItem = useGroupItem();
    const { data } = useSession();
    const [groupItem, setGroupItem] = useState<GroupItem | null>(contextGroupItem.groupItem);
    const [complementItem, setComplementItem] = useState<Item | null>();
    const modalHandler = useModal();

    useEffect(() => {
        setGroupItem(contextGroupItem.groupItem);

        if (contextGroupItem.groupItem?.complement_item) {
            setComplementItem(contextGroupItem.groupItem.complement_item)
        } else {
            setComplementItem(null)
        }
    }, [contextGroupItem.groupItem]);

    const containItems = groupItem?.items && groupItem?.items.length > 0
    const isGroupItemStaging = groupItem?.status === "Staging"

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
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Adicionar complemento</DialogTitle>
                        </DialogHeader>
                        <ComplementItemList groupItem={groupItem} />
                        <DialogClose asChild>
                            <Button variant="outline" className="mt-4 w-full">Fechar</Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
            )}

            {containItems && complementItem &&
                <ComplementItemCard groupItem={groupItem} />
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
                            onClick={async () => {
                                if (!data || !groupItem) return;
                                try {
                                    await CancelGroupItem(groupItem.id, "cancelado pelo usuario", data);
                                    notifySuccess("Item cancelado com sucesso!");

                                    contextGroupItem.fetchData(groupItem.id);
                                    modalHandler.hideModal("cancel-group-item-" + groupItem.id);
                                } catch (error: any) {
                                    notifyError(error.message || 'Erro ao cancelar grupo de itens');
                                }
                            }}
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

export { GroupItemCard };