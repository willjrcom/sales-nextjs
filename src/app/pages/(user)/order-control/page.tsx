"use client"

import CrudLayout from "@/app/components/crud/layout";
import Refresh from "@/app/components/crud/refresh";
import OrderKanban from "@/app/components/order/kanban/kanban";
import OrderItemList from "@/app/components/order/kanban/order-item-list";
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
    }, [data?.user.idToken, dispatch]);

    const stagingOrders = Object.values(ordersSlice.entities).map((order) => order.status === "Staging"? order : null).filter((order) => order !== null);

    const openStagingOrders = () => {
        if (stagingOrders.length === 0) return;

        const onClose = () => {
            modalHandler.hideModal("show-staging-orders")
        }
        const list = stagingOrders.map((order) => <OrderItemList key={order.id} order={order}/>);
        modalHandler.showModal("show-staging-orders", "Pedidos em aberto", list, "sm", onClose);
    }
    return (
        <>
            <CrudLayout
                title="Pedidos"
                searchButtonChildren={
                    <div className="w-1/6">
                        <button className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                        onClick={openStagingOrders}>
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
                tableChildren={<OrderKanban slice={ordersSlice} />}
            />
        </>
    );
};

export default PageOrder;
