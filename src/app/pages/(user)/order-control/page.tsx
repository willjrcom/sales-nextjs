'use client';

import ButtonIconTextFloat from "@/app/components/button/button-float";
import CrudLayout from "@/app/components/crud/layout";
import Refresh from "@/app/components/crud/refresh";
import OrderKanban from "@/app/components/kanban/kanban";
import { useOrders } from "@/app/context/order/context";
import { FaFilter } from "react-icons/fa";

const PageOrder = () => {
    const context = useOrders();
    return (
        <>
        {context.getError() && <p className="mb-4 text-red-500">{context.getError()?.message}</p>}
        <CrudLayout title="Pedidos"
            filterButtonChildren={
                <ButtonIconTextFloat modalName="filter-client" icon={FaFilter}><h1>Filtro</h1></ButtonIconTextFloat>
            }

            refreshButton={
                <Refresh
                    context={context}
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