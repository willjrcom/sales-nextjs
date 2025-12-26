"use client";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import CrudTable from "@/app/components/crud/table";
import { SelectField } from "@/app/components/modal/field";
import CardOrder from "@/app/components/order/card-order";
import Employee from "@/app/entities/employee/employee";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { FaBoxOpen } from "react-icons/fa";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetOrdersWithDelivery from '@/app/api/order/all/delivery/order';
import GetAllDeliveryDrivers from '@/app/api/delivery-driver/delivery-driver';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

const DeliveryOrderFinished = () => {
    const queryClient = useQueryClient();
    const [orderID, setSelectedOrderID] = useState<string>("");
    const [selectedDriverId, setSelectedDriverId] = useState<string>();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { data } = useSession();

    const { data: deliveryOrdersResponse, refetch, isPending } = useQuery({
        queryKey: ['deliveryOrdersWithDelivery'],
        queryFn: () => GetOrdersWithDelivery(data!),
        enabled: !!data?.user?.access_token,
        refetchInterval: 60000,
    });

    const { data: deliveryDriversResponse } = useQuery({
        queryKey: ['deliveryDrivers'],
        queryFn: () => GetAllDeliveryDrivers(data!),
        enabled: !!data?.user?.access_token,
    });

    const deliveryDrivers = useMemo(() => {
        return (deliveryDriversResponse?.items || []).map((dd) => dd.employee);
    }, [deliveryDriversResponse]);

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(new Date().toLocaleTimeString());
    };

    const allOrders = useMemo(() => deliveryOrdersResponse?.items || [], [deliveryOrdersResponse]);

    const { deliveryOrders, ordersNotFinished } = useMemo(() => {
        const deliveredOrders = allOrders.filter((order) => order.delivery?.status === 'Delivered');
        const notFinished = allOrders.filter((order) => order.status === 'Ready' && order.delivery?.status === 'Delivered');

        if (!selectedDriverId) {
            return {
                deliveryOrders: deliveredOrders,
                ordersNotFinished: notFinished
            };
        }

        return {
            deliveryOrders: deliveredOrders.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId),
            ordersNotFinished: notFinished.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId)
        };
    }, [allOrders, selectedDriverId]);

    if (!data) return null;

    return (
        <>
            <div className="flex justify-between items-center gap-4">
                <SelectField
                    friendlyName=""
                    name="name"
                    setSelectedValue={setSelectedDriverId}
                    selectedValue={selectedDriverId || ""}
                    values={deliveryDrivers}
                    optional
                />
                <Refresh onRefresh={handleRefresh} isPending={isPending} lastUpdate={lastUpdate} />
            </div>
            {ordersNotFinished.length > 0 &&
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Pedidos não finalizados</h3>
                    <CrudTable columns={DeliveryOrderColumns()} data={ordersNotFinished} rowSelectionType="radio" selectedRow={orderID} setSelectedRow={setSelectedOrderID} />
                </div>}

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Pedidos finalizados</h3>
                <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders} rowSelectionType="radio" selectedRow={orderID} setSelectedRow={setSelectedOrderID} />
            </div>
            {orderID && <ButtonIconTextFloat modalName={"show-order-" + orderID} icon={FaBoxOpen} title="Ver entrega" position="bottom-right" size="xl" onCloseModal={() => queryClient.invalidateQueries({ queryKey: ['deliveryOrdersWithDelivery'] })}>
                <CardOrder orderId={orderID} />
            </ButtonIconTextFloat>}
        </>
    )
}

export default DeliveryOrderFinished