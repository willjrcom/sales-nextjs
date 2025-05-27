"use client"

import CrudLayout from "@/app/components/crud/layout";
import PageTitle from '@/app/components/PageTitle';
import Refresh from "@/app/components/crud/refresh";
import OrderKanban from "@/app/components/order/kanban/kanban";
import CardOrderListItem from "@/app/components/order/kanban/card-list-orders";
import { useModal } from "@/app/context/modal/context";
import { fetchOrders } from "@/redux/slices/orders";
import { RootState, AppDispatch } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const PageOrder = () => {
    const ordersSlice = useSelector((state: RootState) => state.orders);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const modalHandler = useModal();

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
    }, [data?.user.access_token, dispatch]);

    const stagingOrders = Object.values(ordersSlice.entities).map((order) => order.status === "Staging"? order : null).filter((order) => order !== null);

    
    const openStagingOrders = () => {
        const onClose = () => {
            modalHandler.hideModal("show-staging-orders")
        }
        modalHandler.showModal("show-staging-orders", "Pedidos em aberto", <CardOrderListItem orders={stagingOrders} /> , "sm", onClose);
    }

    const classOrderStaging = stagingOrders.length > 0 ? "text-white bg-red-400 hover:bg-red-500" : "bg-gray-200 hover:bg-gray-300";

    return (
        <>
            <CrudLayout
                title={<PageTitle title="Pedidos" tooltip="Kanban para gerenciamento de pedidos, mostrando o fluxo de cada pedido." />}
                searchButtonChildren={
                    <div>
                        <button
                            className={`px-4 py-2 rounded whitespace-nowrap ${classOrderStaging}`}
                            onClick={openStagingOrders}
                        >
                            {stagingOrders.length} pedidos em aberto
                        </button>
                    </div>
                }
                refreshButton={
                    <Refresh
                        fetchItems={fetchOrders}
                        slice={ordersSlice}
                    />
                }
                filterButtonChildren={
                    <p className="text-sm text-gray-600 mb-4 text-center">
                        Arraste o pedido para a direita para marcar como Pronto.
                    </p>
                }
                tableChildren={<OrderKanban slice={ordersSlice} />}
            />
        </>
    );
};

export default PageOrder;
