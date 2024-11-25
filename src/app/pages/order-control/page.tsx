'use client';

import CrudTable from "@/app/components/crud/table";
import { useOrders } from "@/app/context/order/context";
import OrderColumns from "@/app/entities/order/table-columns";

const PageOrder = () => {
    const context = useOrders();
    return (
        <>
            <h1 className="p-2">Pedidos</h1>
            <CrudTable columns={OrderColumns()} data={context.items}/>
        </>
    )
}

export default PageOrder