"use client";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import { SelectField } from "@/app/components/modal/field";
import CardOrder from "@/app/components/order/card-order";
import Employee from "@/app/entities/employee/employee";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { fetchDeliveryOrders } from "@/redux/slices/delivery-orders";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaBoxOpen } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const DeliveryOrderFinished = () => {
    const dispatch = useDispatch<AppDispatch>();
    const deliveryOrdersSlice = useSelector((state: RootState) => state.deliveryOrders);
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
    const [ordersNotFinished, setOrdersNotFinished] = useState<Order[]>([]);
    const [deliveryDrivers, setDeliveryDrivers] = useState<Employee[]>([]);
    const [orderID, setSelectedOrderID] = useState<string>("");
    const [selectedDriverId, setSelectedDriverId] = useState<string>();
    const { data } = useSession();

    useEffect(() => {
        setDeliveryDrivers(Object.values(deliveryDriversSlice.entities).map((deliveryDriver) => deliveryDriver.employee));
    }, [deliveryDriversSlice.entities]);

    useEffect(() => {
        const token = data?.user?.access_token;
        const hasDeliveryOrdersSlice = deliveryOrdersSlice.ids.length > 0;

        if (token && !hasDeliveryOrdersSlice) {
            dispatch(fetchDeliveryOrders({ session: data }));
        }

        const interval = setInterval(() => {
            const token = data?.user?.access_token;
            const hasDeliveryOrdersSlice = deliveryOrdersSlice.ids.length > 0;

            if (token && !hasDeliveryOrdersSlice) {
                dispatch(fetchDeliveryOrders({ session: data }));
            }
        }, 60000); // Atualiza a cada 60 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.access_token, deliveryOrdersSlice.ids.length]);

    useEffect(() => {
        const orders = Object.values(deliveryOrdersSlice.entities);
        const deliveredOrders = orders.filter((order) => order.delivery?.status === 'Delivered');
        const ordersNotFinished = orders.filter((order) => order?.status === 'Ready' && order.delivery?.status === 'Delivered');

        if (!selectedDriverId) {
            setOrdersNotFinished(ordersNotFinished);
            setDeliveryOrders(deliveredOrders);
            return;
        }

        setOrdersNotFinished(ordersNotFinished.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId));
        setDeliveryOrders(deliveredOrders.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId));
    }, [deliveryOrdersSlice.entities, selectedDriverId]);

    if (!data) return null;

    return (
        <>
            <div className="flex justify-between items-center">
                <SelectField
                    friendlyName=""
                    name="name"
                    setSelectedValue={setSelectedDriverId}
                    selectedValue={selectedDriverId || ""}
                    values={deliveryDrivers}
                    optional
                />
                <Refresh slice={deliveryOrdersSlice} fetchItems={fetchDeliveryOrders} />
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
            {orderID && <ButtonIconTextFloat modalName={"show-order-" + orderID} icon={FaBoxOpen} title="Ver entrega" position="bottom-right" size="xl" onCloseModal={() => dispatch(fetchDeliveryOrders({ session: data }))}>
                <CardOrder orderId={orderID} />
            </ButtonIconTextFloat>}
        </>
    )
}

export default DeliveryOrderFinished