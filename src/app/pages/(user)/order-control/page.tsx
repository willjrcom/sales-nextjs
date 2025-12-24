"use client"

import CrudLayout from "@/app/components/crud/crud-layout";
import PageTitle from '@/app/components/PageTitle';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import OrderKanban from "@/app/components/order/kanban/kanban";
import CardOrderListItem from "@/app/components/order/kanban/card-list-orders";
import { useModal } from "@/app/context/modal/context";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GetOrders from "@/app/api/order/order";
import { notifyError } from "@/app/utils/notifications";

const PageOrder = () => {
    const { data } = useSession();
    const modalHandler = useModal();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: response, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOrders(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar pedidos');
    }, [error]);

    const orders = useMemo(() => response?.items || [], [response?.items]);
    const stagingOrders = useMemo(() => orders.filter((order) => order.status === "Staging"), [orders]);

    const openStagingOrders = () => {
        const onClose = () => {
            modalHandler.hideModal("show-staging-orders")
        }
        modalHandler.showModal("show-staging-orders", "Pedidos em aberto", <CardOrderListItem orders={stagingOrders} />, "sm", onClose);
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

                        <p className="text-sm text-gray-600 mb-4 text-center">
                            Arraste o pedido para a direita para alterar o status.
                        </p>
                    </div>
                }
                refreshButton={
                    <Refresh
                        onRefresh={refetch}
                        isPending={isPending}
                        lastUpdate={lastUpdate}
                    />
                }
                tableChildren={<OrderKanban orders={orders} />}
            />
        </>
    );
};

export default PageOrder;
