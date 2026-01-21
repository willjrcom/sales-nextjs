"use client";

import { useMemo } from "react";
import ButtonIconTextFloat from "../../button/button-float";
import EditGroupItem from "../group-item/edit-group-item";
import { useGroupItem } from "@/app/context/group-item/context";
import { FaSearch } from 'react-icons/fa';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetCategoriesMap } from "@/app/api/category/category";
import { useSession } from "next-auth/react";
import { CardOrderResume } from "../resume/resume";
import CategoryOrder from "../category/category";
import GetOrderByID from "@/app/api/order/[id]/order";
import { notifyError } from "@/app/utils/notifications";

interface CartAddedProps {
    orderId: string;
}

export const CartAdded = ({ orderId }: CartAddedProps) => {
    const contextGroupItem = useGroupItem();
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Buscar pedido com React Query
    const { data: order, refetch } = useQuery({
        queryKey: ['order', 'current'],
        queryFn: async () => {
            if (!orderId || !session?.user?.access_token) return null;
            try {
                return await GetOrderByID(orderId, session);
            } catch (error) {
                notifyError('Erro ao buscar pedido');
                return null;
            }
        },
        enabled: !!orderId && !!session?.user?.access_token,
    });

    const { data: categoriesResponse } = useQuery({
        queryKey: ['categories', 'map', 'product'],
        queryFn: () => GetCategoriesMap(session!, true),
        enabled: !!session?.user.access_token,
        refetchInterval: 60000,
    });

    const categoriesMap = useMemo(() => categoriesResponse?.sort((a, b) => a.name.localeCompare(b.name)) || [], [categoriesResponse]);

    const groupedItems = useMemo(() => groupBy(order?.group_items || [], "category_id"), [order?.group_items]);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
                <FaSearch className="text-4xl mb-2" />
                <h2>Nenhum pedido encontrado</h2>
            </div>
        )
    }

    return (
        <div className="box-border bg-white h-full flex flex-col overflow-x-hidden">
            <div className="mb-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Meus Itens</h1>
                    <CardOrderResume orderId={orderId} />
                </div>
                {order.status !== "Canceled" &&
                    <div onClick={() => contextGroupItem.resetGroupItem()}>
                        <ButtonIconTextFloat size="xl"
                            position="bottom-right"
                            title="Novo grupo de itens"
                            modalName="edit-group-item"
                            onCloseModal={() => refetch()}>
                            <EditGroupItem orderId={orderId} />
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
                        if (categoriesMap.length === 0) return null;
                        const category = categoriesMap.find(cat => cat.id === key);
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
