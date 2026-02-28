import { useSession } from "next-auth/react";
import OrderItemList from "./order-item-list";
import { useMemo, useState } from "react";
import { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useQuery } from "@tanstack/react-query";
import { GetClosedOrders } from "@/app/api/order/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const ListFinishedOrdersCard = () => {
    const { data } = useSession();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { data: ordersResponse, refetch } = useQuery({
        queryKey: ['opened-orders'],
        queryFn: async () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetClosedOrders(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const orders = useMemo(() => ordersResponse?.items || [], [ordersResponse?.items]);
    const finishedOrders = useMemo(() => orders.filter((order) => order.status === "Finished"), [orders]);
    const cancelledOrders = useMemo(() => orders.filter((order) => order.status === "Cancelled"), [orders]);

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-4">
                <p>Sem pedidos disponíveis.</p>
            </div>
        );
    }

    return (
        <Tabs defaultValue="finished" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="finished" className="gap-2">
                    ✅ Finalizados
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {finishedOrders.length}
                    </span>
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="gap-2">
                    ❌ Cancelados
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {cancelledOrders.length}
                    </span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="finished" className="mt-0">
                <div className="flex flex-col space-y-4">
                    {finishedOrders.length > 0 ? (
                        finishedOrders.map((order) => (
                            <OrderItemList key={order.id} order={order} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum pedido finalizado.</p>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="cancelled" className="mt-0">
                <div className="flex flex-col space-y-4">
                    {cancelledOrders.length > 0 ? (
                        cancelledOrders.map((order) => (
                            <OrderItemList key={order.id} order={order} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum pedido cancelado.</p>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    );
};

export default ListFinishedOrdersCard;
