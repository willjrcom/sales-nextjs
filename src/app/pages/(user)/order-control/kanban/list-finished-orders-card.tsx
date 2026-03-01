import { useSession } from "next-auth/react";
import OrderItemList from "./order-item-list";
import Order from "@/app/entities/order/order";
import { useMemo, useState } from "react";
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useQuery } from "@tanstack/react-query";
import { GetClosedOrders } from "@/app/api/order/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCw, CheckCircle2, XCircle } from "lucide-react";


const ListFinishedOrdersCard = () => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { data: ordersResponse, refetch, isFetching } = useQuery({
        queryKey: ['finished-orders'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetClosedOrders(data!);
        },
        enabled: !!data?.access_token,
        refetchInterval: 30000,
    });

    const orders = useMemo(() => ordersResponse?.items || [], [ordersResponse?.items]);
    const finishedOrders = useMemo(() => orders.filter((order: Order) => order.status === "Finished"), [orders]);
    const cancelledOrders = useMemo(() => orders.filter((order: Order) => order.status === "Cancelled"), [orders]);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                        <RotateCw className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Histórico Recente</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Últimos pedidos do turno</p>
                    </div>
                </div>
                <Refresh onRefresh={refetch} isFetching={isFetching} lastUpdate={lastUpdate} removeText />
            </div>

            <Tabs defaultValue="finished" className="w-full flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-xl h-12">
                    <TabsTrigger
                        value="finished"
                        className="gap-2 font-black uppercase text-[10px] tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Finalizados
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px]">
                            {finishedOrders.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="cancelled"
                        className="gap-2 font-black uppercase text-[10px] tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        Cancelados
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px]">
                            {cancelledOrders.length}
                        </span>
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 mt-4">
                    <ScrollArea className="h-[calc(100vh-250px)] w-full pr-4">
                        <TabsContent value="finished" className="mt-0 focus-visible:outline-none">
                            <div className="flex flex-col space-y-3 pb-4">
                                {finishedOrders.length > 0 ? (
                                    finishedOrders.map((order: Order) => (
                                        <OrderItemList key={order.id} order={order} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
                                        <CheckCircle2 className="w-12 h-12 opacity-10" />
                                        <p className="font-bold uppercase text-[10px] tracking-widest">Nenhum pedido finalizado</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="cancelled" className="mt-0 focus-visible:outline-none">
                            <div className="flex flex-col space-y-3 pb-4">
                                {cancelledOrders.length > 0 ? (
                                    cancelledOrders.map((order: Order) => (
                                        <OrderItemList key={order.id} order={order} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
                                        <XCircle className="w-12 h-12 opacity-10" />
                                        <p className="font-bold uppercase text-[10px] tracking-widest">Nenhum pedido cancelado</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </div>
            </Tabs>
        </div>
    );
};

export default ListFinishedOrdersCard;
