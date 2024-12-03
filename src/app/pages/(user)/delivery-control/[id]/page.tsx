'use client';

import RequestError from "@/app/api/error";
import GetOrderByID from "@/app/api/order/[id]/route";
import Order from "@/app/entities/order/order";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PageOrderEdit = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>();
    const [error, setError] = useState<RequestError | null>(null)
    const { data } = useSession();

    const getOrder = useCallback(async () => {
        if (!id || !data || !!order) return;
        try {
            const orderFound = await GetOrderByID(id as string, data);
            setOrder(orderFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
        }
    }, [order, data, id]);

    useEffect(() => {
        getOrder();
    }, [data, getOrder]);


    if (!id || !order) {
        return (
            <>
                {error && <p className="mb-4 text-red-500">{error.message}</p>}
                <h1>Pedido não encontrado</h1>
            </>
        )
    }

    return (
        <>
            <h1>{order.id}</h1>
        </>
    );
}

export default PageOrderEdit