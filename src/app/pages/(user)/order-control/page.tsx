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
    const ordersSlice = useSelector((state: RootState) => state.orders);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(ordersSlice.entities).length === 0) {
            dispatch(fetchOrders(data));
        }
    
        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchOrders(data));
            }
        }, 60000); // Atualiza a cada 60 segundos
    
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken, dispatch]);
    
    return (
        <>
            <CrudLayout
                title="Pedidos"
                refreshButton={
                    <Refresh
                        fetchItems={fetchOrders}
                        slice={ordersSlice}
                    />
                }
                tableChildren={<OrderKanban slice={ordersSlice}/>}
            />
        </>
    );
};

export default PageOrder;
