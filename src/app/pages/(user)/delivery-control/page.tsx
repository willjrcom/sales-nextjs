'use client';

import CrudTable from "@/app/components/crud/table";
import { useOrders } from "@/app/context/order/context";
import Order from "@/app/entities/order/order";
import OrderColumns from "@/app/entities/order/table-columns";
import { useEffect, useState } from "react";

const PageOrder = () => {
    const context = useOrders();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        for (const order of context.items) {
            if (order.delivery) {
                setOrders([...orders, order])
            }
        }
    }, [context.items, orders]);

    return (
        <>
            <h1 className="p-2">Pedidos</h1>
            <CrudTable columns={OrderColumns()} data={orders}/>
        </>
    )
}

export default PageOrder