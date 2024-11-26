'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Order from "@/app/entities/order/order";
import GetOrderByID from "@/app/api/order/[id]/route";
import OrderManager from "../../order";
import RequestError from "@/app/api/error";

const PageNewOrderPickup = () => {
    const { order_id } = useParams();
    const [order, setOrder] = useState<Order | null>();
    const [error, setError] = useState<RequestError | null>(null)
    const { data } = useSession();

    useEffect(() => {
        getOrder();
    }, [data]);

    const getOrder = async () => {
        if (!order_id || !data || !!order) return;
        try {
            const orderFound = await GetOrderByID(order_id as string, data);
            setOrder(orderFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    if (!order_id || !order) {
        return (
            <>
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <h1>Pedido não encontrado</h1>
            </>
        )
    }

    return (
        <OrderManager order={order} />
    );
}
export default PageNewOrderPickup