"use client";

import { useEffect, useState } from "react";
import ButtonIconTextFloat from "../../button/button-float";
import EditGroupItem from "../group-item/edit-group-item";
import { useSelector } from "react-redux";
import { useCurrentOrder } from "@/app/context/current-order/context";
import Order from "@/app/entities/order/order";
import { RootState } from "@/redux/store";
import { useGroupItem } from "@/app/context/group-item/context";
import GroupItem from "@/app/entities/order/group-item";
import CategoryOrder from "../category/category";

export const CartAdded = () => {
    const [groupedItems, setGroupedItems] = useState<Record<string, GroupItem[]>>({})
    const contextGroupItem = useGroupItem();
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const categoriesSlice = useSelector((state: RootState) => state.categories);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    useEffect(() => {
        if (!order) return
        const items = groupBy(order.group_items, "category_id");
        setGroupedItems(items);
    }, [order?.group_items]);

    if (!order) return null

    return (
        <div className="box-border bg-white h-full flex flex-col overflow-x-hidden">
            <div className="mb-2">
                <h1 className="text-xl font-bold mb-1">Meus Itens</h1>
                {order.status !== "Canceled" &&
                    <div onClick={() => contextGroupItem.resetGroupItem()}>
                        <ButtonIconTextFloat size="xl"
                            position="bottom-right"
                            title="Novo grupo de itens"
                            modalName="edit-group-item"
                            onCloseModal={() => contextCurrentOrder.fetchData(order.id)}>
                            <EditGroupItem />
                        </ButtonIconTextFloat>
                    </div>
                }
            </div>

            <div className="flex-1 overflow-y-auto">
                {Object.entries(groupedItems).length === 0 ? (
                    <p className="p-4 text-gray-500">Nenhum item no carrinho</p>
                ) : (
                    Object.entries(groupedItems).map(([key, groupItems]) => {
                        if (Object.values(categoriesSlice.entities).length === 0) return null;
                        const category = categoriesSlice.entities[key];
                        if (!category) return null;
                        return (
                            <CategoryOrder key={key} category={category} groupItems={groupItems} />
                        );
                    })
                )}
            </div>
        </div>
    )
}

function groupBy<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T[]> {
    if (!array || array.length === 0) {
        return {};
    }
    return array?.reduce((result, currentItem) => {
        const groupKey = currentItem[key] as string;

        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(currentItem);
        return result;
    }, {} as Record<string, T[]>);
}
