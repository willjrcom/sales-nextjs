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

export type OrderControlView = 'menu' | 'cart' | 'checkout';

const PageEditOrderControl = () => {
    const { data } = useSession();
    const { id } = useParams();
    const [view, setView] = useState<OrderControlView>('menu');
    const queryClient = useQueryClient();

    useEffect(() => {
        const cachedOrder = queryClient.getQueryData<Order>(['order', 'current']);
        if (cachedOrder && cachedOrder.id !== id) {
            queryClient.setQueryData(['order', 'current'], null);
            queryClient.setQueryData(['group-item', 'current'], null);
            queryClient.invalidateQueries({ queryKey: ['order', 'current'] });
        }
    }, [id, queryClient]);

    useQuery({
        queryKey: ['order', 'current'],
        queryFn: async () => {
            if (!id || !data?.user?.access_token) return null;
            try {
                return await GetOrderByID(id as string, data);
            } catch (error) {
                notifyError('Erro ao buscar pedido: ' + error);
                return null;
            }
        },
        enabled: !!data?.user?.access_token && !!id,
    });

    if (!id) return null;

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