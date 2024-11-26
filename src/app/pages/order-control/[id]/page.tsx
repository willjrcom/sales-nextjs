'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Order from "@/app/entities/order/order";
import GetOrderByID from "@/app/api/order/[id]/route";
import RequestError from "@/app/api/error";
import OrderManager from "@/app/components/order/order";

const PageEditOrderControl = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>();
    const [error, setError] = useState<RequestError | null>(null)
    const { data } = useSession();

    useEffect(() => {
        getOrder();
    }, [data]);

    const getOrder = async () => {
        if (!id || !data || !!order) return;
        try {
            const orderFound = await GetOrderByID(id as string, data);
            setOrder(orderFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }

    if (!id || !order) {
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
export default PageEditOrderControl