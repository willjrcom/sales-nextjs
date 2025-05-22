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
            <div className="flex h-[68vh]">
                {/* Componente à esquerda: ocupa 70% da tela */}
                <CartToAdd />
                <ShowGroupItem />
            </div>
        );
    }

    return (
        <div className="flex h-[68vh]">
            <ShowGroupItem />
        </div>
    );
}

const ShowGroupItem = () => {
    const contextGroupItem = useGroupItem();
    const [groupItem, setGroupItem] = useState<GroupItem | null>(contextGroupItem.groupItem);
    const [complementItem, setComplementItem] = useState<Item | null>();

    useEffect(() => {
        console.log("updated: ", contextGroupItem.groupItem)
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
        <div className="bg-gray-100 p-3 space-y-4 overflow-y-auto h-full lg:block hidden lg:w-[30vw]">
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
}