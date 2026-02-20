'use client';

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import GetOrderByID from "@/app/api/order/[id]/order";
import { notifyError } from "@/app/utils/notifications";
import { useState } from "react";
import { MenuSection } from "./components/MenuSection";
import { CartSection } from "./components/CartSection";
import { CheckoutSection } from "./components/CheckoutSection";

export type OrderControlView = 'menu' | 'cart' | 'checkout';

const PageEditOrderControl = () => {
    const { data } = useSession();
    const { id } = useParams();
    const [view, setView] = useState<OrderControlView>('menu');

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