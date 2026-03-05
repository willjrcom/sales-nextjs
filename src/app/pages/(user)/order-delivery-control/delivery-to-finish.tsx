"use client";

import RequestError from "@/app/utils/error";
import DeliveryOrderDelivery from "@/app/api/order-delivery/status/delivery/order-delivery";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import CrudTable from "@/app/components/crud/table";
// import type { Point } from "@/app/components/map/map";
// import dynamic from 'next/dynamic';
// const Map = dynamic(() => import("@/app/components/map/map"), { ssr: false });
// import GetCompany from "@/app/api/company/company";
// import Address from "@/app/entities/address/address";
import { FaCheck } from "react-icons/fa";
import { SelectField } from "@/app/components/modal/field";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/utils/format";
import Decimal from 'decimal.js';
import CardOrder from "@/app/components/card-order/card-order";
import { useModal } from "@/app/context/modal/context";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import GetAllDeliveryDrivers from '@/app/api/delivery-driver/delivery-driver';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { useUser } from "@/app/context/user-context";
import AccessDenied from "@/app/components/access-denied";
import { GetOrdersWithShippedDelivery } from "../../../api/order/all/delivery/order";

const DeliveryOrderToFinish = () => {
    // const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    // const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
    // const [points, setPoints] = useState<Point[]>([]);
    const [orderID, setSelectedOrderID] = useState<string>("");
    const [selectedOrder, setOrder] = useState<Order | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<string>();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));
    const { data } = useSession();
    const { hasPermission, user } = useUser();

    const { isFetching, data: deliveryOrdersResponse, refetch } = useQuery({
        queryKey: ['shipped-delivery-orders'],
        queryFn: () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOrdersWithShippedDelivery(data!);
        },
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
        placeholderData: keepPreviousData,
    });

    const { data: deliveryDriversResponse } = useQuery({
        queryKey: ['delivery-drivers'],
        queryFn: () => GetAllDeliveryDrivers(data!),
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    if (!user) {
        return <AccessDenied message="Usuário não encontrado ou sessão expirada." />;
    }

    if (!hasPermission('order-delivery-control-to-finish')) {
        return <AccessDenied />
    }

    const allOrders = useMemo(() => deliveryOrdersResponse?.items || [], [deliveryOrdersResponse?.items]);

    const deliveryDrivers = useMemo(() => {
        return (deliveryDriversResponse?.items || []).map((dd) => dd.employee);
    }, [deliveryDriversResponse?.items]);

    const deliveryOrders = useMemo(() => {
        const shippedOrders = allOrders.filter((order) => order.delivery?.status === 'Shipped');

        const filteredOrders = !selectedDriverId
            ? shippedOrders
            : shippedOrders.filter((order) => order.delivery?.driver?.employee_id === selectedDriverId);

        return filteredOrders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }, [allOrders, selectedDriverId]);

    useEffect(() => {
        const order = allOrders.find(o => o.id === orderID);
        if (!order) return setOrder(null);
        setOrder(order);
    }, [orderID, allOrders]);

    // useEffect(() => {
    //     setCentralCoordinates();
    // }, [data?.user?.access_token]);

    // const setCentralCoordinates = async () => {
    //     if (!data) return;

    //     const company = await GetCompany(data);
    //     if (!data || !company.address) return;

    //     const coordinates = company.address.coordinates;

    //     const point = { id: company.id, lat: coordinates.latitude, lng: coordinates.longitude, label: company.trade_name } as Point;
    //     setCenterPoint(point);
    // };

    // useEffect(() => {
    //     const newPoints: Point[] = [];
    //     const newSelectedPoints: Point[] = [];

    //     for (let order of deliveryOrders) {
    //         const address = Object.assign(new Address(), order.delivery?.address);
    //         if (!address) continue;

    //         const coordinates = address.coordinates;
    //         if (!coordinates) continue;

    //         const point = { id: order.id, lat: coordinates.latitude, lng: coordinates.longitude, label: address.getSmallAddress() } as Point;

    //         if (orderID === order.id) {
    //             newSelectedPoints.push(point);
    //         } else {
    //             newPoints.push(point);
    //         }
    //     }

    //     setSelectedPoints(newSelectedPoints);
    //     setPoints(newPoints);
    // }, [deliveryOrders, orderID]);

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
                <Refresh onRefresh={refetch} isFetching={isFetching} lastUpdate={lastUpdate} />
            </div>
            <CrudTable columns={DeliveryOrderColumns()} data={deliveryOrders} rowSelectionType="radio" selectedRow={orderID} setSelectedRow={setSelectedOrderID} />
            {/* <div className="flex flex-col md:flex-row gap-2 items-start">
                
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-2">
                </div>
                
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-2">
                    <Map key={"center-point"} mapId="delivery-to-finish" centerPoint={centerPoint} points={points} selectedPoints={selectedPoints} />
                </div>
            </div> */}
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
    const [isProcessing, setIsProcessing] = useState(false);
    const { data } = useSession();
    const modalHandler = useModal();

    if (!order) return <>Nenhum pedido selecionado</>

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

        setIsProcessing(true);
        try {
            await DeliveryOrderDelivery(deliveryID, data);

            notifySuccess("Entrega recebida com sucesso");
            queryClient.invalidateQueries({ queryKey: ['shipped-delivery-orders'] });

            modalHandler.hideModal("finish-delivery");
            showOrder(order.id);
        } catch (error: RequestError | any) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao receber entrega");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const paymentMethod = order.delivery?.payment_method || 'N/A';
    const change = order.delivery?.change ? new Decimal(order.delivery.change).toFixed(2) : '0.00';
    const totalToReceive = new Decimal(order.total).plus(new Decimal(order.delivery?.change || 0)).toNumber();

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Receber Entrega?</h2>
                <p className="text-gray-500 font-medium">Confirma a finalização desta entrega?</p>
            </div>

            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Método</span>
                    <span className="font-black text-gray-800">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Total do Pedido</span>
                    <span className="font-black text-gray-800">{formatCurrency(Number(order.total))}</span>
                </div>
                {new Decimal(change).gt(0) && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Troco p/ Cliente</span>
                        <span className="font-black text-amber-600">{formatCurrency(Number(change))}</span>
                    </div>
                )}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-emerald-600 font-black uppercase text-[12px] tracking-widest">Total a Receber</span>
                    <div className="text-right">
                        <span className="block text-[10px] font-bold text-emerald-600/50 uppercase tracking-tighter leading-none mb-1">(Pedido + Troco)</span>
                        <span className="text-2xl font-black text-emerald-700">{formatCurrency(totalToReceive)}</span>
                    </div>
                </div>
            </div>

            <Button
                onClick={submit}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest h-12 rounded-xl gap-2 shadow-lg shadow-emerald-100"
            >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isProcessing ? 'Confirmando...' : 'Confirmar Recebimento'}
            </Button>
        </div>
    );
};

export default DeliveryOrderToFinish