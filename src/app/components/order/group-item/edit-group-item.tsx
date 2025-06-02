"use client";

import { useGroupItem } from "@/app/context/group-item/context";
import { useEffect, useState } from "react";
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
                className={`fixed top-1/2 transform -translate-y-1/2 z-50 [writing-mode:vertical-rl] rotate-180 cursor-pointer focus:outline-none bg-green-500 text-white p-2 rounded-r-md transition-all duration-300 ${isOpen ? 'right-[30vw]' : 'right-0'}`}
            >
                Carrinho
            </button>

            <div className="fixed right-0 top-0 h-full z-40">
                <div className={`h-full bg-gray-200 text-white overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-[30vw]' : 'w-0'} origin-right`}>
                    {isOpen && <GroupItemCard />}
                </div>
            </div>
        </div>
    );
}

const GroupItemCard = () => {
    const contextGroupItem = useGroupItem();
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
        <div className="p-4 text-black min-w-full">
            {/* Defina o min-h para o tamanho mínimo em telas pequenas, e lg:block para visibilidade em telas grandes */}
            <h2 className="text-xl font-semibold">Produtos selecionados</h2>
            <p className="text-sm">id: {groupItem?.id}</p>
            {/* Produto Selecionado */}
            <div className="space-y-2">
                {groupItem?.items?.map((item) => (
                    <ItemCard item={item} key={item.id} />
                ))}
            </div>

            {/* Adicionar complemento */}
            {containItems && <p className="text-lg font-semibold">Complemento</p>}
            {containItems && !complementItem && isGroupItemStaging && <ButtonIconText size="md" title="Adicionar complemento" modalName={"add-complement-item-group-item-" + groupItem?.id} onCloseModal={() => contextGroupItem.fetchData(groupItem?.id || "")}>
                <ComplementItemList groupItem={groupItem} />
            </ButtonIconText>}

            {containItems && complementItem &&
                <ComplementItemCard groupItem={groupItem} />
            }

            <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total:</p>
                <p className="text-xl font-bold">R$ {new Decimal(groupItem?.total_price || "0").toFixed(2)}</p>
            </div>
            <hr className="my-4" />

            {groupItem?.status && <p><strong>Status:</strong> <StatusComponent status={groupItem.status} /></p>}
            {groupItem?.status == "Staging" as StatusGroupItem &&
                <GroupItemForm item={groupItem} />
            }
        </div>
    );
};