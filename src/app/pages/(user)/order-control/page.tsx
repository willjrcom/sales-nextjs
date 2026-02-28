"use client"

import PageTitle from '@/app/components/ui/page-title';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import OrderKanban from "@/app/pages/(user)/order-control/kanban/kanban";
import ListItemsCard from "@/app/pages/(user)/order-control/kanban/list-items-card";
import { useModal } from "@/app/context/modal/context";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetOpenedOrders } from "@/app/api/order/order";
import { notifyError } from "@/app/utils/notifications";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import ListFinishedOrdersCard from './kanban/list-finished-orders-card';
import { ClipboardList, AlertCircle, LayoutGrid, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PageOrder = () => {
    const { data } = useSession();
    const modalHandler = useModal();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isFetching, error, data: ordersResponse, refetch } = useQuery({
        queryKey: ['opened-orders'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOpenedOrders(data!);
        },
        // @ts-ignore
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar pedidos: ' + error.message);
    }, [error]);

    const orders = useMemo(() => ordersResponse?.items || [], [ordersResponse?.items]);
    const stagingOrders = useMemo(() => orders.filter((order) => order.status === "Staging"), [orders]);

    const openStagingOrders = () => {
        const onClose = () => {
            modalHandler.hideModal("show-staging-orders")
        }
        modalHandler.showModal("show-staging-orders", "Pedidos Não Enviados", <ListItemsCard orders={stagingOrders} />, "sm", onClose);
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50/30 overflow-hidden">
            <ButtonIconTextFloat modalName="show-finished-orders" icon={ClipboardList} position="bottom-right" title="Pedidos finalizados">
                <ListFinishedOrdersCard />
            </ButtonIconTextFloat>

            <div className="flex-1 flex flex-col min-h-0">
                {/* Header Premium */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                                    Monitor de Pedidos
                                </h1>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    Gestão em tempo real
                                </p>
                            </div>
                        </div>

                        {stagingOrders.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-9 rounded-full px-4 gap-2 font-bold shadow-lg shadow-red-200 animate-pulse"
                                onClick={openStagingOrders}
                            >
                                <AlertCircle className="w-4 h-4" />
                                {stagingOrders.length} Pendentes de Envio
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sincronizado</span>
                            <span className="text-xs font-black text-gray-600 tracking-tight">{lastUpdate}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn("rounded-xl border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md", isFetching && "animate-spin")}
                            onClick={() => refetch()}
                        >
                            <RotateCw className="w-4 h-4 text-gray-500" />
                        </Button>
                    </div>
                </div>

                {/* Área do Kanban com Scroll Customizado */}
                <div className="flex-1 overflow-auto bg-gray-50/50 p-4">
                    <OrderKanban orders={orders} />
                </div>
            </div>
        </div>
    );
};

export default PageOrder;
