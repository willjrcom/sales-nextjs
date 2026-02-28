"use client";

import ButtonIconTextFloat from "@/app/components/button/button-float";
import CrudTable from "@/app/components/crud/table";
// import dynamic from 'next/dynamic';
// import type { Point } from "@/app/components/map/map";
// const Map = dynamic(() => import("@/app/components/map/map"), { ssr: false });
// import Address from "@/app/entities/address/address";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { FaMotorcycle } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import AccessDenied from "@/app/components/access-denied";
import { useUser } from "@/app/context/user-context";
import { GetOrdersWithReadyDelivery } from "../../../api/order/all/delivery/order";
import SelectDeliveryDriver from "./select-delivery-driver";

const DeliveryOrderToShip = () => {
    // const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    // const [points, setPoints] = useState<Point[]>([]);
    // const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectedDeliveryIDs, setSelectedDeliveryIDs] = useState<string[]>([]);
    const [selectedOrderIDs, setSelectedOrderIDs] = useState<string[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { data } = useSession();
    const { hasPermission, user } = useUser();

    const { isFetching, data: deliveryOrdersResponse, refetch } = useQuery({
        queryKey: ['ready-delivery-orders'],
        queryFn: () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOrdersWithReadyDelivery(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    if (!user) {
        return <AccessDenied message="Usuário não encontrado ou sessão expirada." />;
    }

    if (!hasPermission('order-delivery-control-to-ship')) {
        return <AccessDenied />
    }

    const orders = useMemo(() => deliveryOrdersResponse?.items || [], [deliveryOrdersResponse?.items]);
    const readyOrders = useMemo(() => orders.filter((order) => order.delivery?.status === 'Ready'), [orders]);
    const readyOrdersSorted = useMemo(() => readyOrders.sort((a, b) => new Date(a.ready_at!).getTime() - new Date(b.ready_at!).getTime()), [readyOrders]);

    // const getCenterPoint = async () => {
    //     if (!data) return;

    //     const company = await GetCompany(data);
    //     if (!company) return notifyError("Nenhuma empresa encontrada");

    //     const address = company.address;
    //     if (!company.address) return notifyError("Nenhuma endereço encontrada");

    //     const coordinates = address.coordinates;
    //     if (!coordinates) return notifyError("Nenhuma coordenada encontrada");

    //     const point = { id: company.id, lat: coordinates.latitude, lng: coordinates.longitude, label: company.trade_name } as Point;
    //     setCenterPoint(point);
    // };

    // useEffect(() => {
    //     getCenterPoint();
    // }, [status]);

    useEffect(() => {
        const deliveryIDs: string[] = [];
        const orderIDs: string[] = [];
        // const newPoints: Point[] = [];
        // const newSelectedPoints: Point[] = [];

        for (let order of readyOrdersSorted) {
            if (selectedRows.has(order.id)) {
                // newSelectedPoints.push(point);
                deliveryIDs.push(order.delivery?.id || "");
                orderIDs.push(order.id || "");
            }
            // const address = order.delivery?.address;
            // if (!address) continue;

            // const coordinates = address.coordinates;
            // if (!coordinates) continue;

            // const point = { id: order.id, lat: coordinates.latitude, lng: coordinates.longitude, label: address.getSmallAddress() } as Point;

            // else {
            //     newPoints.push(point);
            // }
        }

        setSelectedDeliveryIDs(deliveryIDs);
        setSelectedOrderIDs(orderIDs);
        // setSelectedPoints(newSelectedPoints);
        // setPoints(newPoints);

    }, [readyOrdersSorted, selectedRows]);

    return (
        <>
            <div className="flex justify-end items-center">
                <Refresh onRefresh={refetch} isFetching={isFetching} lastUpdate={lastUpdate} />
            </div>

            <CrudTable columns={DeliveryOrderColumns()} data={readyOrdersSorted} rowSelectionType="checkbox" selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
            <div className="flex flex-col md:flex-row gap-2 items-start">
                {/* Tabela */}
                {/* <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-2">
                </div>
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-2">
                    <Map mapId="delivery-to-ship" centerPoint={centerPoint} points={points} selectedPoints={selectedPoints} />
                </div> */}
            </div>

            {selectedRows.size > 0 &&
                <ButtonIconTextFloat modalName="ship-delivery" icon={FaMotorcycle} title="Enviar entrega" position="bottom-right">
                    <SelectDeliveryDriver deliveryIDs={selectedDeliveryIDs} orderIDs={selectedOrderIDs} />
                </ButtonIconTextFloat>
            }
        </>
    )
}


export default DeliveryOrderToShip