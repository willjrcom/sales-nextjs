'use client';

import Menu from "@/app/components/menu/layout";
import Table from "@/app/entities/table/table";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Order from "@/app/entities/order/order";
import GetOrderByID from "@/app/api/order/[id]/route";
import { useSession } from "next-auth/react";
import OrderManager from "../../order";

const PageNewOrderTable = () => {
    return (
        <Menu>
            <Page/>
        </Menu>
    );
}

const Page = () => {
    const { order_id } = useParams();
    const [order, setOrder] = useState<Order | null>();
    const { data } = useSession();

    useEffect(() => {
        getOrder();
    }, [data]);

    const getOrder = async () => {
        if (!order_id || !data || !!order) return;
        console.log(order_id)
        const orderFound = await GetOrderByID(order_id as string, data);
        setOrder(orderFound);
    }

    if (!order_id || !order) {
        return (
            <h1>Pedido não encontrado</h1>
        )
    }
    
    return (
        <OrderManager order={order}/>
    );
}
export default PageNewOrderTable