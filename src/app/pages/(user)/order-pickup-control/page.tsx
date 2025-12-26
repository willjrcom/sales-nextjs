"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import PageTitle from '@/app/components/PageTitle';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import { useSession } from "next-auth/react";
import PickupOrderColumns from "@/app/entities/order/pickup-table-columns";
import { useQuery } from "@tanstack/react-query";
import GetOrdersWithPickup from "@/app/api/order/all/pickup/order";
import { notifyError } from "@/app/utils/notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PickupOrderPage = () => {
    const { data } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'prontas';
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const handleTabChange = (value: string) => {
        router.push(`?tab=${value}`, { scroll: false });
    };

    const { isPending, error, data: pickupOrdersResponse, refetch } = useQuery({
        queryKey: ['pickup-orders'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOrdersWithPickup(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    useEffect(() => {
        if (error) notifyError('Erro ao carregar pedidos de retirada');
    }, [error]);

    const allOrders = useMemo(() => pickupOrdersResponse?.items || [], [pickupOrdersResponse]);

    const last10 = useMemo(() => [...allOrders].sort((a, b) => {
        const da = a.pickup?.ready_at || '';
        const db = b.pickup?.ready_at || '';
        return db.localeCompare(da);
    }).slice(0, 10), [allOrders]);

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
                        <Refresh onRefresh={refetch} isPending={isPending} lastUpdate={lastUpdate} />
                    </div>
                    {allOrders.length === 0 
                        ? <p className="text-gray-500">Nenhum pedido disponível</p>
                        : <CrudTable columns={PickupOrderColumns(true)} data={allOrders} />
                    }
                </TabsContent>
                <TabsContent value="ultimos-10">
                    <div className="flex justify-end items-center mb-2">
                        <Refresh onRefresh={refetch} isPending={isPending} lastUpdate={lastUpdate} />
                    </div>
                    {last10.length === 0 
                        ? <p className="text-gray-500">Nenhum pedido disponível</p>
                        : <CrudTable columns={PickupOrderColumns(false)} data={last10} />
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PickupOrderPage