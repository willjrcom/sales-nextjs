'use client';

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GetOrderByID from "@/app/api/order/[id]/order";
import { notifyError } from "@/app/utils/notifications";
import { useState, useEffect } from "react";
import { MenuSection } from "./components/MenuSection";
import { CartSection } from "./components/CartSection";
import { CheckoutSection } from "./components/CheckoutSection";
import Order from "@/app/entities/order/order";
import RequestError from "@/app/utils/error";

export type OrderControlView = 'menu' | 'cart' | 'checkout';

const PageEditOrderControl = () => {
    const { data } = useSession();
    const { id } = useParams();
    const [view, setView] = useState<OrderControlView>('cart');
    const queryClient = useQueryClient();

    useEffect(() => {
        const cachedOrder = queryClient.getQueryData<Order>(['order', 'current']);
        if (cachedOrder && cachedOrder.id !== id) {
            queryClient.setQueryData(['order', 'current'], null);
            queryClient.setQueryData(['group-item', 'current'], null);
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
        }
    }, [id, queryClient]);

    const { isLoading, data: order, error } = useQuery({
        queryKey: ['order', 'current'],
        queryFn: () => GetOrderByID(id as string, data!),
        enabled: !!data?.user?.access_token && !!id,
    });

    if (!id) return (
        <div className="w-full h-full bg-gray-50">
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-sm">
                    <p>Selecione um pedido para editar</p>
                </div>
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="w-full h-full bg-gray-50">
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-sm">
                    <p>Carregando...</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="w-full h-full bg-gray-50">
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-sm">
                    <p>Erro ao carregar pedido: {error.message}</p>
                </div>
            </div>
        </div>
    );

    if (order?.status === "Finished") return (
        <div className="w-full h-full bg-gray-50">
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-sm">
                    <p>Pedido finalizado, não é possível editar</p>
                </div>
            </div>
        </div>
    );

    if (order?.status === "Cancelled") return (
        <div className="w-full h-full bg-gray-50">
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-sm">
                    <p>Pedido cancelado, não é possível editar</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full bg-gray-50">
            {view === 'menu' && (
                <MenuSection orderID={id as string} setView={setView} />
            )}
            {view === 'cart' && (
                <CartSection orderID={id as string} setView={setView} />
            )}
            {view === 'checkout' && (
                <CheckoutSection orderID={id as string} setView={setView} />
            )}
        </div>
    );
}

export default PageEditOrderControl