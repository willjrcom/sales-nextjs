"use client";

import { useGroupItem } from "@/app/context/group-item/context";
import { useSession } from 'next-auth/react';
import CancelGroupItem from '@/app/api/group-item/status/group-item-cancel';
import { useEffect, useState } from "react";
import { notifyError } from '@/app/utils/notifications';
import ItemCard from "../item/card-item";
import GroupItem, { StatusGroupItem } from "@/app/entities/order/group-item";
import GroupItemForm from "@/app/forms/group-item/form";
import StatusComponent from "../../button/show-status";
import ButtonIconText from "../../button/button-icon-text";
import ComplementItemList from "./list-complement-item";
import ComplementItemCard from "./complement-item";
import Item from "@/app/entities/order/item";
import { CartToAdd } from "../cart/cart-to-add";
import Decimal from "decimal.js";

export default function EditGroupItem() {
    const contextGroupItem = useGroupItem();

    if (!contextGroupItem.groupItem || contextGroupItem.groupItem?.status === "Staging") {
        return (
            <div >
                {/* Componente à esquerda: ocupa 70% da tela */}
                <CartToAdd />
                <ShowGroupItem isOpened={false} />
            </div>
        );
    }

    return (
        <GroupItemCard />
    );
}

interface ShowGroupItemProps {
    isOpened: boolean
}

const ShowGroupItem = ({ isOpened }: ShowGroupItemProps) => {
    const [isOpen, setIsOpen] = useState(isOpened || false);

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`fixed top-1/3 transform -translate-y-1/2 z-50 [writing-mode:vertical-rl] rotate-180 cursor-pointer focus:outline-none bg-yellow-500 text-white p-2 rounded-r-md transition-all duration-300 ${isOpen ? 'right-[40vw]' : 'right-0'}`}
            >
                Carrinho
            </button>

            <div className={`fixed bg-gray-200 right-0 inset-y-8 border border-gray-300 rounded-l-md z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-[40vw]' : 'w-0'} origin-right`}>
                <div className="h-full p-4 overflow-y-auto flex flex-col">
                    {isOpen && <GroupItemCard />}
                </div>
            </div>
        </div>
    );
}

const GroupItemCard = () => {
    const contextGroupItem = useGroupItem();
    const { data } = useSession();
    const [groupItem, setGroupItem] = useState<GroupItem | null>(contextGroupItem.groupItem);
    const [complementItem, setComplementItem] = useState<Item | null>();

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
                {groupItem?.items?.map((item) => (
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
            {containItems && !complementItem && isGroupItemStaging && <ButtonIconText size="xl" title="Adicionar complemento" modalName={"add-complement-item-group-item-" + groupItem?.id} onCloseModal={() => contextGroupItem.fetchData(groupItem?.id || "")}>
                <ComplementItemList groupItem={groupItem} />
            </ButtonIconText>}

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
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={async () => {
                            if (!data || !groupItem) return;
                            try {
                                await CancelGroupItem(groupItem, data);
                                contextGroupItem.fetchData(groupItem.id);
                            } catch (error: any) {
                                notifyError(error.message || 'Erro ao cancelar grupo de itens');
                            }
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};