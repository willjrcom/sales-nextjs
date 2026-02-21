"use client";

import GetCompany from "@/app/api/company/company";
import RequestError from "@/app/utils/error";
import ShipOrderDelivery from "@/app/api/order-delivery/status/ship/order-delivery";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Carousel from "@/components/carousel/carousel";
import { FaUserCircle } from 'react-icons/fa';
import CrudTable from "@/app/components/crud/table";
// import dynamic from 'next/dynamic';
// import type { Point } from "@/app/components/map/map";
// const Map = dynamic(() => import("@/app/components/map/map"), { ssr: false });
// import Address from "@/app/entities/address/address";
import { useModal } from "@/app/context/modal/context";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { FaMotorcycle } from "react-icons/fa";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import printOrder from "@/app/components/print/print-order";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetOrdersWithDelivery from '@/app/api/order/all/delivery/order';
import GetAllDeliveryDrivers from '@/app/api/delivery-driver/delivery-driver';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import AccessDenied from "@/app/components/access-denied";
import { useUser } from "@/app/context/user-context";

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

    const { data: deliveryOrdersResponse, refetch, isPending } = useQuery({
        queryKey: ['delivery-orders'],
        queryFn: () => {
            setLastUpdate(FormatRefreshTime(new Date()));
            return GetOrdersWithDelivery(data!);
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
                <Refresh onRefresh={refetch} isPending={isPending} lastUpdate={lastUpdate} />
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

interface ModalData {
    deliveryIDs: string[];
    orderIDs: string[];
}

export const SelectDeliveryDriver = ({ deliveryIDs, orderIDs }: ModalData) => {
    const queryClient = useQueryClient();
    const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>();
    const [isProcessing, setIsProcessing] = useState(false);
    const { data } = useSession();
    const modalHandler = useModal();
    const [lastUpdate, setLastUpdate] = useState<string>(FormatRefreshTime(new Date()));

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(data!),
        enabled: !!data?.user?.access_token,
    })

    const { data: deliveryDriversResponse, refetch, isPending } = useQuery({
        queryKey: ['delivery-drivers'],
        queryFn: () => GetAllDeliveryDrivers(data!),
        enabled: !!data?.user?.access_token,
        refetchInterval: 30000,
    });

    const deliveryDrivers = useMemo(() => deliveryDriversResponse?.items || [], [deliveryDriversResponse?.items]);

    const handleRefresh = async () => {
        await refetch();
        setLastUpdate(FormatRefreshTime(new Date()));
    };

    const submit = async () => {
        if (!data) return;

        if (deliveryIDs.length === 0) {
            notifyError('Selecione pelo menos uma entrega');
            return;
        }

        if (!selectedDriver) {
            notifyError('Selecione um entregador');
            return;
        }

        const deliveryOrderIds = Array.from(deliveryIDs);

        setIsProcessing(true);
        try {
            await ShipOrderDelivery(deliveryOrderIds, selectedDriver.id, data);
            queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });

            if (orderIDs.length > 1) {
                notifySuccess("Entregas enviadas com sucesso");
            } else {
                notifySuccess("Entrega enviada com sucesso");
            }

            if (company?.preferences.enable_print_order_on_ship_delivery) {
                for (let i = 0; i < orderIDs.length; i++) {
                    await printOrder({
                        orderID: orderIDs[i],
                        session: data,
                        company: company,
                        printerKey: "printer_delivery_on_ship_delivery"
                    });
                }
            }

            modalHandler.hideModal("ship-delivery");
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao enviar entregas");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="items-center mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Selecione um entregador:</h3>
                    <Refresh onRefresh={handleRefresh} isPending={isPending} lastUpdate={lastUpdate} />
                </div>
                {deliveryDrivers.length === 0 && <p className="text-gray-500">Nenhum entregador cadastrado</p>}

                <Carousel items={deliveryDrivers}>
                    {(driver) => {
                        const isSelected = selectedDriver?.id === driver.id;
                        return (
                            <div
                                key={driver.id}
                                className={`flex flex-col items-center p-4 border rounded-lg shadow cursor-pointer transition-transform transform hover:scale-105 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                                    }`}
                                onClick={() => setSelectedDriver(driver)}
                            >
                                <FaUserCircle className="text-4xl text-gray-400 mb-2" />
                                <p className="font-semibold text-gray-700 text-center">
                                    {driver.employee.name}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {driver.order_deliveries?.length || 0} entrega{driver.order_deliveries?.length === 1 ? '' : 's'}
                                </p>
                                {isSelected && (
                                    <span className="mt-2 text-xs font-medium text-blue-600">
                                        Selecionado
                                    </span>
                                )}
                            </div>
                        );
                    }}
                </Carousel>
            </div>

            {deliveryDrivers.length > 0 && (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submit}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Enviando...' : 'Enviar entregas'}
                </button>
            )}
        </>
    )
}

export default DeliveryOrderToShip