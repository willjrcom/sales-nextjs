'use client';

import CrudTable from "@/app/components/crud/table";
import { useDeliveryOrders } from "@/app/context/order-delivery/context";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import OrderDelivery from "@/app/entities/order/order-delivery";
import { useEffect, useState } from "react";

const PageDeliveryOrder = () => {
    const contextDeliveryOrder = useDeliveryOrders();
    const [deliveryOrders, setDeliveryOrders] = useState<OrderDelivery[]>(contextDeliveryOrder.items);

    useEffect(() => {
        console.log(contextDeliveryOrder.items)
        setDeliveryOrders(contextDeliveryOrder.items);
    }, [contextDeliveryOrder.items]);

    return (
        <>
            <h1 className="p-2">Entregas</h1>
            <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders}/>
        </>
    )
}

export default PageDeliveryOrder