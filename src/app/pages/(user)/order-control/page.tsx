"use client"

import CrudLayout from "@/app/components/crud/layout";
import Refresh from "@/app/components/crud/refresh";
import OrderKanban from "@/app/components/kanban/kanban";
import { fetchOrders } from "@/redux/slices/orders";
import { RootState, AppDispatch } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const PageOrder = () => {
    const orders = useSelector((state: RootState) => state.orders);
    const dispatch = useDispatch<AppDispatch>();  // Tipagem correta do dispatch
    const { data } = useSession();

    useEffect(() => {
        if (!data) return;
        dispatch(fetchOrders(data)); // Dispara a ação assíncrona corretamente
    }, [data, dispatch]);

    return (
        <>
            <CrudLayout
                title="Pedidos"
                refreshButton={
                    <Refresh
                        fetchItems={fetchOrders}
                        lastUpdate={orders.lastUpdate}
                    />
                }
                tableChildren={<OrderKanban />}
            />
        </>
    );
};

export default PageOrder;
