"use client";

import { useState, useEffect, useMemo } from "react";
import PageTitle from '@/app/components/PageTitle';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import { useSession } from "next-auth/react";
import PickupOrderColumns from "@/app/entities/order/pickup-table-columns";
import "./style.css";
import { useQuery } from "@tanstack/react-query";
import GetOrdersWithPickup from "@/app/api/order/all/pickup/order";
import { notifyError } from "@/app/utils/notifications";

const PickupOrderPage = () => {
    const { data } = useSession();
    const [activeTab, setActiveTab] = useState<'Prontas' | 'Últimos 10'>('Prontas');
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { isPending, error, data: response, refetch } = useQuery({
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

    const allOrders = useMemo(() => response?.items || [], [response]);

    const last10 = useMemo(() => [...allOrders].sort((a, b) => {
        const da = a.pickup?.ready_at || '';
        const db = b.pickup?.ready_at || '';
        return db.localeCompare(da);
    }).slice(0, 10), [allOrders]);

    const renderContent = () => {
        const dataToShow = activeTab === 'Prontas' ? allOrders : last10;
        if (dataToShow.length === 0) {
            return <p className="text-gray-500">Nenhum pedido disponível</p>;
        }
        return <CrudTable columns={PickupOrderColumns()} data={dataToShow} />;
    };

    return (
        <div className="container">
            <PageTitle title="Controle de Retiradas" tooltip="Gerencie pedidos de retirada por status." />
            <div className="tabs">
                <button className={`tab ${activeTab === 'Prontas' ? 'active' : ''}`} onClick={() => setActiveTab('Prontas')}>Prontas</button>
                <button className={`tab ${activeTab === 'Últimos 10' ? 'active' : ''}`} onClick={() => setActiveTab('Últimos 10')}>Últimos 10</button>
            </div>
            <div className="content">
                <div className="flex justify-end items-center mb-2">
                    <Refresh onRefresh={refetch} isPending={isPending} lastUpdate={lastUpdate} />
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

interface ModalData {
    pickupIDs: string[];
    orderIDs: string[];
}

export default PickupOrderPage