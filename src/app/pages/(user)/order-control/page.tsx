'use client';

import CrudLayout from "@/app/components/crud/layout";
import Refresh from "@/app/components/crud/refresh";
import OrderKanban from "@/app/components/kanban/kanban";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const PageOrder = () => {
    const orders = useSelector((state: RootState) => state.orders);

    return (
        <>
        <CrudLayout title="Pedidos"
            refreshButton={
                <Refresh
                    slice={orders}
                />
            }
            tableChildren={
                <OrderKanban />
            }
        />
    </>
    )
}

export default PageOrder