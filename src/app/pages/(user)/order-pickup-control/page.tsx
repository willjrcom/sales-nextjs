"use client";

import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import Order from "@/app/entities/order/order";
import { fetchPickupOrders } from "@/redux/slices/pickup-orders";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PickupOrderColumns from "@/app/entities/order/pickup-table-columns";

const PickupOrderPage = () => {
    const ordersSlice = useSelector((state: RootState) => state.pickupOrders);
    const [orders, setOrders] = useState<Order[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(ordersSlice.entities).length === 0) {
            dispatch(fetchPickupOrders({ session: data }));
        }

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchPickupOrders({ session: data }));
            }
        }, 30000); // Atualiza a cada 30 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.access_token, dispatch]);

    useEffect(() => {
        setOrders(Object.values(ordersSlice.entities));
    }, [ordersSlice.entities]);

    return (
        <>
            <div className="flex justify-end items-center">
                <Refresh slice={ordersSlice} fetchItems={fetchPickupOrders} />
            </div>

            <CrudTable columns={PickupOrderColumns()} data={orders} rowSelectionType="checkbox"  />
        </>
    )
}

interface ModalData {
    pickupIDs: string[];
    orderIDs: string[];
}

export default PickupOrderPage