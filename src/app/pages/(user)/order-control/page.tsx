'use client';

import ButtonIconTextFloat from "@/app/components/button/button-float";
import CrudLayout from "@/app/components/crud/layout";
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import { useOrders } from "@/app/context/order/context";
import OrderColumns from "@/app/entities/order/table-columns";
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
                <CrudTable columns={OrderColumns()} data={context.items?.sort((a, b) => a.order_number - b.order_number)}/>
            }
        />
    </>
    )
}

export default PageOrder