'use client';

import CrudTable from "@/app/components/crud/table";
import Menu from "@/app/components/menu/layout";
import { useOrders } from "@/app/context/order/context";
import OrderColumns from "@/app/entities/order/table-columns";

const PageOrder = () => {
    return (
        <Menu>
            <Page/>
        </Menu>
    )
}

const Page = () => {
    const context = useOrders();
    return (
        <>
            <h1 className="p-2">Pedidos</h1>
            <CrudTable columns={OrderColumns()} data={context.items}/>
        </>
    )
}

export default PageOrder