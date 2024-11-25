'use client';

import GetOrderByID from "@/app/api/order/[id]/route";
import Order from "@/app/entities/order/order";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const PageOrderEdit = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>();
    const { data } = useSession();
    
    useEffect(() => {
        getOrder();
    }, [data]);

    const getOrder = async () => {
        if (!id || !data || !!order) return;
        const orderFound = await GetOrderByID(id as string, data);
        setOrder(orderFound);
    }

    if (!id || !order) {
        return (
            <h1>Pedido não encontrado</h1>
        )
    }
    
    return (
        <>
            <h1>{order.id}</h1>
        </>
    );
}

export default PageOrderEdit