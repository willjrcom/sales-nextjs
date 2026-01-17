"use client";

import { useEffect, useMemo, useState } from "react";
import ButtonIconTextFloat from "../../button/button-float";
import EditGroupItem from "../group-item/edit-group-item";
import { useCurrentOrder } from "@/app/context/current-order/context";
import Order from "@/app/entities/order/order";
import { useGroupItem } from "@/app/context/group-item/context";
import GroupItem from "@/app/entities/order/group-item";
import CategoryOrder from "../category/category";
import { FaSearch } from 'react-icons/fa';
import { useQuery } from "@tanstack/react-query";
import GetCategories from "@/app/api/category/category";
import { useSession } from "next-auth/react";
import { CardOrderResume } from "../resume/resume";

export const CartAdded = () => {
    const contextGroupItem = useGroupItem();
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const { data: session } = useSession();

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories'],
        queryFn: () => GetCategories(session!),
        enabled: !!session?.user.access_token,
    });

    const categories = useMemo(() => categoriesResponse?.items.sort((a, b) => a.name.localeCompare(b.name)) || [], [categoriesResponse?.items]);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    const groupedItems = useMemo(() => groupBy(order?.group_items || [], "category_id"), [order?.group_items]);

    if (!order) return null

    return (
        <div className="box-border bg-white h-full flex flex-col overflow-x-hidden">
            <div className="mb-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Meus Itens</h1>
                    <CardOrderResume />
                </div>
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
                    <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
                        <FaSearch className="text-4xl mb-2" />
                        <h2>Nenhum item adicionado no carrinho</h2>
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([key, groupItems]) => {
                        if (categories.length === 0) return null;
                        const category = categories.find(cat => cat.id === key);
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
