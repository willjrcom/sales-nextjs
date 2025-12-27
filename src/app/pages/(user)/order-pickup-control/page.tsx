"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import PageTitle from '@/app/components/PageTitle';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import { useSession } from "next-auth/react";
import PickupOrderColumns from "@/app/entities/order/pickup-table-columns";
import { useQuery } from "@tanstack/react-query";
import { GetOrdersWithPickupReady, GetOrdersWithPickupDelivered } from "@/app/api/order/all/pickup/order";
import { notifyError } from "@/app/utils/notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PickupOrderPage = () => {
    const { data } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'prontas';
    const [lastUpdateReady, setLastUpdateReady] = useState<string>(FormatRefreshTime(new Date()));
    const [lastUpdateDelivered, setLastUpdateDelivered] = useState<string>(FormatRefreshTime(new Date()));

    const handleTabChange = (value: string) => {
        router.push(`?tab=${value}`, { scroll: false });
    };

    // Query para pedidos prontos (status Ready)
    const { isPending: isPendingReady, error: errorReady, data: readyOrdersResponse, refetch: refetchReady } = useQuery({
        queryKey: ['pickup-orders-ready'],
        queryFn: async () => {
            setLastUpdateReady(FormatRefreshTime(new Date()));
            return GetOrdersWithPickupReady(data!);
        },
        enabled: !!data,
        refetchInterval: 30000,
    });

    // Query para últimos 10 entregues (status Delivered)
    const { isPending: isPendingDelivered, error: errorDelivered, data: deliveredOrdersResponse, refetch: refetchDelivered } = useQuery({
        queryKey: ['pickup-orders-delivered'],
        queryFn: async () => {
            setLastUpdateDelivered(FormatRefreshTime(new Date()));
            return GetOrdersWithPickupDelivered(data!);
        },
        enabled: !!data,
        refetchInterval: 30000,
    });

    useEffect(() => {
        if (errorReady) notifyError('Erro ao carregar pedidos prontos para retirada');
    }, [errorReady]);

    useEffect(() => {
        if (errorDelivered) notifyError('Erro ao carregar últimos pedidos entregues');
    }, [errorDelivered]);

    const readyOrders = useMemo(() => readyOrdersResponse?.items || [], [readyOrdersResponse]);
    const deliveredOrders = useMemo(() => (deliveredOrdersResponse?.items || []).sort((a, b) => new Date(b.pickup?.delivered_at || 0).getTime() - new Date(a.pickup?.delivered_at || 0).getTime()), [deliveredOrdersResponse]);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <PageTitle title="Controle de Retiradas" tooltip="Gerencie pedidos de retirada por status." />
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prontas">Prontas</TabsTrigger>
                    <TabsTrigger value="ultimos-10">Últimos 10</TabsTrigger>
                </TabsList>
                <TabsContent value="prontas">
                    <div className="flex justify-end items-center mb-2">
                        <Refresh onRefresh={refetchReady} isPending={isPendingReady} lastUpdate={lastUpdateReady} />
                    </div>
                    {readyOrders.length === 0 
                        ? <p className="text-gray-500">Nenhum pedido pronto para retirada</p>
                        : <CrudTable columns={PickupOrderColumns(true)} data={readyOrders} />
                    }
                </TabsContent>
                <TabsContent value="ultimos-10">
                    <div className="flex justify-end items-center mb-2">
                        <Refresh onRefresh={refetchDelivered} isPending={isPendingDelivered} lastUpdate={lastUpdateDelivered} />
                    </div>
                    {deliveredOrders.length === 0 
                        ? <p className="text-gray-500">Nenhum pedido entregue recentemente</p>
                        : <CrudTable columns={PickupOrderColumns(false)} data={deliveredOrders} />
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PickupOrderPage