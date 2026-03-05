"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PageTitle from '@/app/components/ui/page-title';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import PickupOrderColumns from "@/app/entities/order/pickup-table-columns";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { GetOrdersWithPickupReady, GetOrdersWithPickupDelivered } from "@/app/api/order/all/pickup/order";
import DeliveryPickup from "@/app/api/order-pickup/status/delivery/order-pickup";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import ThreeColumnHeader from "@/components/header/three-column-header";
import { Button } from "@/components/ui/button";
import { Monitor, LayoutDashboard, Clock, CheckCircle2 } from "lucide-react";
import Order from "@/app/entities/order/order";

const PickupOrderPage = () => {
    const { data: session } = useSession() as any;
    const [isClientView, setIsClientView] = useState(false);
    const [deliveringId, setDeliveringId] = useState<string | null>(null);
    const [lastUpdateReady, setLastUpdateReady] = useState<string>(FormatRefreshTime(new Date()));
    const [lastUpdateDelivered, setLastUpdateDelivered] = useState<string>(FormatRefreshTime(new Date()));

    const queryClient = useQueryClient();

    // Query para pedidos prontos (status Ready)
    const { isFetching: isFetchingReady, error: errorReady, data: readyOrdersResponse, refetch: refetchReady } = useQuery({
        queryKey: ['pickup-orders-ready'],
        queryFn: async () => {
            setLastUpdateReady(FormatRefreshTime(new Date()));
            return GetOrdersWithPickupReady(session!);
        },
        enabled: !!session?.user?.access_token,
        refetchInterval: 10000, // Intervalo mais curto para tela de monitoramento
        placeholderData: keepPreviousData,
    });

    // Query para últimos 10 entregues (status Delivered)
    const { isFetching: isFetchingDelivered, error: errorDelivered, data: deliveredOrdersResponse, refetch: refetchDelivered } = useQuery({
        queryKey: ['pickup-orders-delivered'],
        queryFn: async () => {
            setLastUpdateDelivered(FormatRefreshTime(new Date()));
            return GetOrdersWithPickupDelivered(session!);
        },
        enabled: !!session?.user?.access_token,
        refetchInterval: 10000,
        placeholderData: keepPreviousData,
    });

    const handleDeliver = async (id: string) => {
        try {
            setDeliveringId(id);
            await DeliveryPickup(id, session!);
            notifySuccess("Pedido entregue com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['pickup-orders-ready'] });
            queryClient.invalidateQueries({ queryKey: ['pickup-orders-delivered'] });
        } catch (err: any) {
            notifyError("Erro ao entregar pedido: " + (err.message || "Erro desconhecido"));
        } finally {
            setDeliveringId(null);
        }
    }

    useEffect(() => {
        if (errorReady) notifyError('Erro ao carregar pedidos prontos para retirada: ' + errorReady.message);
    }, [errorReady]);

    useEffect(() => {
        if (errorDelivered) notifyError('Erro ao carregar últimos pedidos entregues: ' + errorDelivered.message);
    }, [errorDelivered]);

    const readyOrders = useMemo(() => (readyOrdersResponse?.items || []).sort((a: Order, b: Order) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [readyOrdersResponse?.items]);
    const deliveredOrders = useMemo(() => (deliveredOrdersResponse?.items || []).sort((a: Order, b: Order) => new Date(b.pickup?.delivered_at || 0).getTime() - new Date(a.pickup?.delivered_at || 0).getTime()), [deliveredOrdersResponse?.items]);

    const clientReadyOrders = readyOrders.slice(0, 10);
    const clientDeliveredOrders = deliveredOrders.slice(0, 5);

    return (
        <div className="w-full px-4 py-4 space-y-6">
            <ThreeColumnHeader
                left={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsClientView(!isClientView)}
                        className="bg-white border-gray-100 text-blue-600 hover:text-blue-700 rounded-xl transition-all font-bold px-4 shadow-sm"
                    >
                        {isClientView ? (
                            <><LayoutDashboard className="w-4 h-4 mr-2" /> Gestão</>
                        ) : (
                            <><Monitor className="w-4 h-4 mr-2" /> Tela do Cliente</>
                        )}
                    </Button>
                }
                center={<PageTitle title="Controle de Retiradas" tooltip="Gerencie pedidos de retirada por status." />}
                subtitle={isClientView ? "Exibição otimizada para monitor do cliente" : "Os pedidos prontos aparecerão aqui"}
            />

            {!isClientView ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Pedidos Prontos</h2>
                            <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-black">{readyOrders.length}</div>
                        </div>
                        <Refresh onRefresh={refetchReady} isFetching={isFetchingReady} lastUpdate={lastUpdateReady} />
                    </div>

                    {readyOrders.length === 0
                        ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                                <Clock className="w-16 h-16 text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center">Nenhum pedido pronto para retirada</p>
                            </div>
                        )
                        : (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <CrudTable
                                    columns={PickupOrderColumns(true, handleDeliver, deliveringId || undefined)}
                                    data={readyOrders}
                                />
                            </div>
                        )
                    }
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
                    {/* Left: Ready Orders (Top 10) */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border-2 border-emerald-100 overflow-hidden flex flex-col">
                        <div className="bg-emerald-600 px-8 py-6 flex items-center justify-between shadow-md">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center">
                                <Monitor className="w-8 h-8 mr-3" />
                                Prontos para Retirada
                            </h2>
                            <div className="bg-white/20 text-white px-4 py-1 rounded-full text-xl font-bold tabular-nums">
                                {readyOrders.length}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {clientReadyOrders.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {clientReadyOrders.map((order: Order) => (
                                        <div key={order.id} className="bg-emerald-50 rounded-3xl p-6 flex flex-col items-center justify-center border-2 border-emerald-200 animate-in fade-in zoom-in duration-500">
                                            <span className="text-6xl font-black text-emerald-700 mb-2 tabular-nums">#{order.order_number}</span>
                                            <span className="text-xl font-bold text-emerald-600 uppercase truncate w-full text-center">
                                                {order.pickup?.name || 'Cliente'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                    <Clock className="w-24 h-24 mb-4 opacity-10" />
                                    <p className="text-2xl font-black uppercase tracking-widest opacity-20">Aguardando pedidos...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Delivered Orders (Last 5) */}
                    <div className="bg-gray-50 rounded-[2.5rem] shadow-inner border border-gray-100 overflow-hidden flex flex-col">
                        <div className="bg-gray-800 px-8 py-6 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center">
                                <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-400" />
                                Últimos Entregues
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {clientDeliveredOrders.length > 0 ? (
                                clientDeliveredOrders.map((order: Order) => (
                                    <div key={order.id} className="bg-white rounded-3xl p-5 flex items-center justify-between border border-gray-100 shadow-sm opacity-60 grayscale hover:grayscale-0 transition-all">
                                        <div className="flex items-center gap-6">
                                            <span className="text-4xl font-black text-gray-400 tabular-nums">#{order.order_number}</span>
                                            <span className="text-lg font-bold text-gray-500 uppercase truncate">
                                                {order.pickup?.name || 'Cliente'}
                                            </span>
                                        </div>
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-200">
                                    <p className="text-lg font-black uppercase tracking-widest opacity-30">Nenhum histórico recente</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupOrderPage;