'use client';

import CrudTable from "@/app/components/crud/table";
import Map from "@/app/components/map/map";
import { useDeliveryOrders } from "@/app/context/order-delivery/context";
import Address from "@/app/entities/address/address";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import OrderDelivery from "@/app/entities/order/order-delivery";
import geocodeAddressOpenCage, { apiKey } from "@/app/service/address-to-coordinates/geocode";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


const PageDeliveryOrder = () => {
    const contextDeliveryOrder = useDeliveryOrders();
    const [deliveryOrders, setDeliveryOrders] = useState<OrderDelivery[]>(contextDeliveryOrder.items);
    const [points, setPoints] = useState<{ id: string; lat: number; lng: number; label: string }[]>([]);
    const { data } = useSession();

    const fetchAddress = async (address: string) => {
        const coordinates = await geocodeAddressOpenCage(address, apiKey)
        if (!coordinates) return
        const point = { id: "4", lat: coordinates.lat, lng: coordinates.lng, label: address }
        setPoints([point])
    }
    useEffect(() => {
        setDeliveryOrders(contextDeliveryOrder.items);
    }, [contextDeliveryOrder.items]);

    useEffect(() => {
        if (!data || !data?.user?.currentCompany?.address) return
        // Converte o objeto plain em uma instância de Address
        const addressInstance = Object.assign(new Address(), data.user.currentCompany.address);
    
        // Agora o método toString deve funcionar
        fetchAddress(addressInstance.toString())
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