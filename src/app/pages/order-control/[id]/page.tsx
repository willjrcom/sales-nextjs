'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Order from "@/app/entities/order/order";
import GetOrderByID from "@/app/api/order/[id]/route";
import RequestError from "@/app/api/error";
import OrderManager from "@/app/components/order/order";
import { useCurrentOrder } from "@/app/context/current-order/context";

const PageEditOrderControl = () => {
    const { id } = useParams();
    const [error, setError] = useState<RequestError | null>(null)
    const { data } = useSession();
    const context = useCurrentOrder();

    useEffect(() => {
        getOrder();
    }, [data]);

    const getOrder = async () => {
        if (!id || !data) return;
        try {
            const orderFound = await GetOrderByID(id as string, data);
            context.updateCurrentOrder(orderFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    if (!id || !context.order) {
        return (
            <>
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <h1>Pedido não encontrado</h1>
            </>
        )
    }

    return (
        <OrderManager />
    );
}
export default PageEditOrderControl