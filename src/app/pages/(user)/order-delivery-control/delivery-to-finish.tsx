"use client";
import RequestError from "@/app/utils/error";
import DeliveryOrderDelivery from "@/app/api/order-delivery/status/delivery/order-delivery";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import dynamic from 'next/dynamic';
import type { Point } from "@/app/components/map/map";
const Map = dynamic(() => import("@/app/components/map/map"), { ssr: false });
import { SelectField } from "@/app/components/modal/field";
import Decimal from 'decimal.js';
import CardOrder from "@/app/components/order/card-order";
import { useModal } from "@/app/context/modal/context";
import Address from "@/app/entities/address/address";
import Employee from "@/app/entities/employee/employee";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { fetchDeliveryOrders } from "@/redux/slices/delivery-orders";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { notifyError } from "@/app/utils/notifications";
import { fetchOrders } from "@/redux/slices/orders";
import GetCompany from "@/app/api/company/company";

const DeliveryOrderToFinish = () => {
    const dispatch = useDispatch<AppDispatch>();
    const deliveryOrdersSlice = useSelector((state: RootState) => state.deliveryOrders);
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
    const [deliveryDrivers, setDeliveryDrivers] = useState<Employee[]>([]);
    const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [orderID, setSelectedOrderID] = useState<string>("");
    const [selectedOrder, setOrder] = useState<Order | null>(null);
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
        }, 30000); // Atualiza a cada 30 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.access_token, deliveryOrdersSlice.ids.length]);

    useEffect(() => {
        const shippedOrders = Object.values(deliveryOrdersSlice.entities).filter((order) => order.delivery?.status === 'Shipped');

        if (!selectedDriverId) {
            setDeliveryOrders(shippedOrders);
            return;
        }

        setDeliveryOrders(shippedOrders.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId));
    }, [deliveryOrdersSlice.entities, selectedDriverId]);

    useEffect(() => {
        const order = deliveryOrdersSlice.entities[orderID]
        if (!order) return setOrder(null)

        setOrder(order);
    }, [orderID]);

    useEffect(() => {
        setCentralCoordinates()
    }, [data?.user.access_token])

    const setCentralCoordinates = async () => {
        if (!data) return

        const company = await GetCompany(data);
        if (!data || !company.address) return

        const coordinates = company.address.coordinates

        const point = { id: company.id, lat: coordinates.latitude, lng: coordinates.longitude, label: company.trade_name } as Point;
        setCenterPoint(point);
    }

    useEffect(() => {
        const newPoints: Point[] = [];
        const newSelectedPoints: Point[] = [];

        for (let order of deliveryOrders) {
            const address = Object.assign(new Address(), order.delivery?.address);
            if (!address) continue;

            const coordinates = address.coordinates
            if (!coordinates) continue;

            const point = { id: order.id, lat: coordinates.latitude, lng: coordinates.longitude, label: address.getSmallAddress() } as Point;


            if (orderID === order.id) {
                newSelectedPoints.push(point);
            } else {
                newPoints.push(point);
            }
        }

        setSelectedPoints(newSelectedPoints);
        setPoints(newPoints);
    }, [deliveryOrders, orderID]);

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
            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Tabela */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders} rowSelectionType="radio" selectedRow={orderID} setSelectedRow={setSelectedOrderID} />
                </div>
                {/* Mapa */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <Map mapId="delivery-to-finish" centerPoint={centerPoint} points={points} selectedPoints={selectedPoints} />
                </div>
            </div>
            {orderID && <ButtonIconTextFloat modalName="finish-delivery" icon={FaCheck} title="Finalizar entrega" position="bottom-right">
                <FinishDelivery order={selectedOrder} />
            </ButtonIconTextFloat>}
        </>
    )
}

interface FinishDeliveryProps {
    order: Order | null;
}
export const FinishDelivery = ({ order }: FinishDeliveryProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const modalHandler = useModal();

    if (!order) return <></>

    const showOrder = (orderId: string) => {
        const onClose = () => {
            modalHandler.hideModal("show-order-" + orderId)
        }
        modalHandler.showModal(
            "show-order-" + orderId,
            "Ver Pedido",
            <CardOrder orderId={orderId} />,
            "xl",
            onClose
        );
    };

    const submit = async () => {
        if (!data) return;
        const deliveryID = order.delivery?.id;
        if (!deliveryID) {
            notifyError('ID da entrega inválido');
            return;
        }


        try {
            await DeliveryOrderDelivery(deliveryID, data);
            dispatch(fetchDeliveryOrders({ session: data }));
            dispatch(fetchOrders({ session: data }));
            modalHandler.hideModal("finish-delivery");
            showOrder(order.id);
        } catch (error: RequestError | any) {
            notifyError(error);
        }
    }

    const paymentMethod = order.delivery?.payment_method || 'N/A';
    const change = order.delivery?.change ? new Decimal(order.delivery.change).toFixed(2) : '0.00';
    const total = new Decimal(order.total_payable).toFixed(2);
    return (
        <div>
            <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">Confirma finalização da entrega?</p>
                <p className="text-sm"><strong>Método de pagamento:</strong> {paymentMethod}</p>
                <p className="text-sm"><strong>Troco (R$):</strong> {change}</p>
                <p className="text-sm"><strong>Valor total (R$):</strong> {total}</p>
            </div>
            <button
                className="w-full inline-flex justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                onClick={submit}
            >
                Confirmar entrega
            </button>
        </div>
    );
};

export default DeliveryOrderToFinish