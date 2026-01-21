'use client';

import { useParams } from "next/navigation";
import { CartAdded } from "@/app/components/order/cart/cart-added";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import GetOrderByID from "@/app/api/order/[id]/order";
import { notifyError } from "@/app/utils/notifications";

const PageEditOrderControl = () => {
    const { data } = useSession();
    const { id } = useParams();

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

    return (
        <div className="w-full">
            <CartAdded />
        </div>
    );
}

export default PageEditOrderControl