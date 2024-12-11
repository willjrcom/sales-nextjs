'use client';

import CrudTable from "@/app/components/crud/table";
import Map, { Point } from "@/app/components/map/map";
import { useDeliveryOrders } from "@/app/context/order-delivery/context";
import Address from "@/app/entities/address/address";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const PageDeliveryOrder = () => {
    const contextDeliveryOrder = useDeliveryOrders();
    const [deliveryOrders, setDeliveryOrders] = useState<Order[]>(contextDeliveryOrder.items);
    const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const { data } = useSession();

    useEffect(() => {
        setDeliveryOrders(contextDeliveryOrder.items);
    }, [contextDeliveryOrder.items]);

    useEffect(() => {
        if (!data || !data?.user?.currentCompany?.address) return
        const company = data?.user?.currentCompany;
        const coordinates = company.address.coordinates

        const point = { id: company.id, lat: coordinates.latitude, lng: coordinates.longitude, label: company.trade_name } as Point;
        setCenterPoint(point);
    }, [data])

    useEffect(() => {
        const newPoints: Point[] = [];
        for (let deliveryOrder of deliveryOrders) {
            const address = Object.assign(new Address(), deliveryOrder.delivery?.address);
            if (!address) continue;

            const coordinates = address.coordinates
            if (!coordinates) continue;

            const point = { id: deliveryOrder.id, lat: coordinates.latitude, lng: coordinates.longitude, label: address.getSmallAddress() } as Point;
            newPoints.push(point);
        }

        setPoints(newPoints);
    }, [deliveryOrders])

    return (
        <>
            <h1 className="text-lg font-bold">Entregas</h1>
            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Tabela */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders} />
                </div>
                {/* Mapa */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <Map centerPoint={centerPoint} points={points} />
                </div>
            </div>
        </>
    )
}

export default PageDeliveryOrder