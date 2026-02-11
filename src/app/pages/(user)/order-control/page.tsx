"use client"

import PageTitle from '@/app/components/ui/page-title';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import OrderKanban from "@/app/pages/(user)/order-control/kanban/kanban";
import ListItemsCard from "@/app/pages/(user)/order-control/kanban/list-items-card";
import { useModal } from "@/app/context/modal/context";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GetOrders from "@/app/api/order/order";
import { notifyError } from "@/app/utils/notifications";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import { FaList } from "react-icons/fa";
import ThreeColumnHeader from '@/components/header/three-column-header';

const PageOrder = () => {
    const { data } = useSession();
    const modalHandler = useModal();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: ordersResponse, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOrders(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar pedidos');
    }, [error]);

    const orders = useMemo(() => ordersResponse?.items || [], [ordersResponse?.items]);
    const stagingOrders = useMemo(() => orders.filter((order) => order.status === "Staging"), [orders]);
    const finishedOrders = useMemo(() => orders.filter((order) => order.status === "Finished"), [orders]);

    const openStagingOrders = () => {
        const onClose = () => {
            modalHandler.hideModal("show-staging-orders")
        }
        modalHandler.showModal("show-staging-orders", "Pedidos em aberto", <ListItemsCard orders={stagingOrders} />, "sm", onClose);
    }

    const classOrderStaging = stagingOrders.length > 0 ? "text-white bg-red-400 hover:bg-red-500" : "bg-gray-200 hover:bg-gray-300";

    return (
        <>
            <ButtonIconTextFloat modalName="show-finished-orders" icon={FaList} position="bottom-right" title="Pedidos finalizados">
                <ListItemsCard orders={finishedOrders} />
            </ButtonIconTextFloat>

            <div className="w-full h-full px-3 py-2">
                {/* Header compacto inline */}
                <div className="flex items-center justify-between gap-4 mb-2">
                    <button
                        className={`px-3 py-1.5 text-sm rounded whitespace-nowrap ${classOrderStaging}`}
                        onClick={openStagingOrders}
                    >
                        {stagingOrders.length} pedidos em aberto
                    </button>

                    <ThreeColumnHeader center={<div className="flex items-center gap-2">
                        <PageTitle title="Pedidos" tooltip="Kanban para gerenciamento de pedidos, mostrando o fluxo de cada pedido." />
                        <span className="text-xs text-gray-500">Arraste para alterar status</span>
                    </div>} />

                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
                    />
                </div>

                {/* Kanban ocupa todo o espaço restante */}
                <div className="w-full">
                    <OrderKanban orders={orders} />
                </div>
            </div>
        </>
    );
};

export default PageOrder;
