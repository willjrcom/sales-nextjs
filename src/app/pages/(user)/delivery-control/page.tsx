'use client';

import CrudTable from "@/app/components/crud/table";
import Map from "@/app/components/map/map";
import { useDeliveryOrders } from "@/app/context/order-delivery/context";
import Address from "@/app/entities/address/address";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import OrderDelivery from "@/app/entities/order/order-delivery";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


const PageDeliveryOrder = () => {
    const contextDeliveryOrder = useDeliveryOrders();
    const [deliveryOrders, setDeliveryOrders] = useState<OrderDelivery[]>(contextDeliveryOrder.items);
    const [points, setPoints] = useState<{ id: string; lat: number; lng: number; label: string }[]>([]);
    const { data } = useSession();

    useEffect(() => {
        setDeliveryOrders(contextDeliveryOrder.items);
    }, [contextDeliveryOrder.items]);

    useEffect(() => {
        if (!data || !data?.user?.currentCompany?.address) return
        // Converte o objeto plain em uma instância de Address
        const addressInstance = Object.assign(new Address(), data.user.currentCompany.address);
        console.log(addressInstance.coordinates)
        // Agora o método toString deve funcionar
        const point = { id: "4", lat: data.user.currentCompany.address.coordinates?.latitude, lng: data.user.currentCompany.address.coordinates?.longitude, label: addressInstance.toString() };
        setPoints([point]);
    }, [data])

    return (
        <>
            <h1 className="p-2">Entregas</h1>
            <div className="flex items-center justify-between">
                <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders}/>
                <Map points={points} />
            </div>
        </>
    )
}

export default PageDeliveryOrder