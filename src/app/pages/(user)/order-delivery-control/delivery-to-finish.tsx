"use client";
import RequestError from "@/app/utils/error";
import DeliveryOrderDelivery from "@/app/api/order-delivery/status/delivery/order-delivery";
import ButtonIconTextFloat from "@/app/components/button/button-float";
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
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import GetCompany from "@/app/api/company/company";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetOrdersWithDelivery from '@/app/api/order/all/delivery/order';
import GetAllDeliveryDrivers from '@/app/api/delivery-driver/delivery-driver';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

const DeliveryOrderToFinish = () => {
    const queryClient = useQueryClient();
    const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [orderID, setSelectedOrderID] = useState<string>("");
    const [selectedOrder, setOrder] = useState<Order | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<string>();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { data } = useSession();

    const { data: deliveryOrdersResponse, refetch, isPending } = useQuery({
        queryKey: ['deliveryOrdersWithDelivery'],
        queryFn: () => GetOrdersWithDelivery(data!),
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const { data: deliveryDriversResponse } = useQuery({
        queryKey: ['deliveryDrivers'],
        queryFn: () => GetAllDeliveryDrivers(data!),
        enabled: !!data?.user?.access_token,
    });

    const allOrders = useMemo(() => deliveryOrdersResponse?.items || [], [deliveryOrdersResponse?.items]);

    const deliveryDrivers = useMemo(() => {
        return (deliveryDriversResponse?.items || []).map((dd) => dd.employee);
    }, [deliveryDriversResponse?.items]);

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(new Date().toLocaleTimeString());
    };

    const deliveryOrders = useMemo(() => {
        const shippedOrders = allOrders.filter((order) => order.delivery?.status === 'Shipped');

        if (!selectedDriverId) {
            return shippedOrders;
        }

        return shippedOrders.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId);
    }, [allOrders, selectedDriverId]);

    useEffect(() => {
        const order = allOrders.find(o => o.id === orderID);
        if (!order) return setOrder(null);
        setOrder(order);
    }, [orderID, allOrders]);

    useEffect(() => {
        setCentralCoordinates();
    }, [data?.user.access_token]);

    const setCentralCoordinates = async () => {
        if (!data) return;

        const company = await GetCompany(data);
        if (!data || !company.address) return;

        const coordinates = company.address.coordinates;

        const point = { id: company.id, lat: coordinates.latitude, lng: coordinates.longitude, label: company.trade_name } as Point;
        setCenterPoint(point);
    };

    useEffect(() => {
        const newPoints: Point[] = [];
        const newSelectedPoints: Point[] = [];

        for (let order of deliveryOrders) {
            const address = Object.assign(new Address(), order.delivery?.address);
            if (!address) continue;

            const coordinates = address.coordinates;
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
            <div className="flex justify-between items-center gap-4">
                <Refresh onRefresh={handleRefresh} isPending={isPending} lastUpdate={lastUpdate} />
                <SelectField
                    friendlyName=""
                    name="name"
                    setSelectedValue={setSelectedDriverId}
                    selectedValue={selectedDriverId || ""}
                    values={deliveryDrivers}
                    optional
                />
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
            {orderID && <ButtonIconTextFloat modalName="finish-delivery" icon={FaCheck} title="Receber entrega" position="bottom-right">
                <FinishDelivery order={selectedOrder} />
            </ButtonIconTextFloat>}
        </>
    )
}

interface FinishDeliveryProps {
    order: Order | null;
}
export const FinishDelivery = ({ order }: FinishDeliveryProps) => {
    const queryClient = useQueryClient();
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

            notifySuccess("Entrega recebida com sucesso");
            queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] });

            modalHandler.hideModal("finish-delivery");
            showOrder(order.id);
        } catch (error: RequestError | any) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao receber entrega");
            console.error(err);
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