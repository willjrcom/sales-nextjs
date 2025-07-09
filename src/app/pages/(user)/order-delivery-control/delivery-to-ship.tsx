"use client";
import GetCompany from "@/app/api/company/company";
import RequestError from "@/app/utils/error";
import ShipOrderDelivery from "@/app/api/order-delivery/status/ship/order-delivery";
import ButtonIconTextFloat from "@/app/components/button/button-float";
import Carousel from "@/app/components/carousel/carousel";
import { FaUserCircle } from 'react-icons/fa';
import Refresh from "@/app/components/crud/refresh";
import CrudTable from "@/app/components/crud/table";
import dynamic from 'next/dynamic';
import type { Point } from "@/app/components/map/map";
const Map = dynamic(() => import("@/app/components/map/map"), { ssr: false });
import { useModal } from "@/app/context/modal/context";
import Address from "@/app/entities/address/address";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";
import DeliveryOrderColumns from "@/app/entities/order/delivery-table-columns";
import Order from "@/app/entities/order/order";
import { fetchDeliveryDrivers } from "@/redux/slices/delivery-drivers";
import { fetchDeliveryOrders } from "@/redux/slices/delivery-orders";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaMotorcycle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { notifyError } from "@/app/utils/notifications";
import printOrder from "@/app/components/print/print-order";
import { fetchOrders } from "@/redux/slices/orders";

const DeliveryOrderToShip = () => {
    const ordersSlice = useSelector((state: RootState) => state.deliveryOrders);
    const [orders, setOrders] = useState<Order[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const [centerPoint, setCenterPoint] = useState<Point | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [selectedDeliveryIDs, setSelectedDeliveryIDs] = useState<string[]>([]);
    const [selectedOrderIDs, setSelectedOrderIDs] = useState<string[]>([]);
    const { data, status } = useSession();

    useEffect(() => {
        if (data && Object.keys(ordersSlice.entities).length === 0) {
            dispatch(fetchDeliveryOrders({ session: data }));
        }

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchDeliveryOrders({ session: data }));
            }
        }, 30000); // Atualiza a cada 30 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [status]);

    useEffect(() => {
        const orders = Object.values(ordersSlice.entities).filter((order) => order.delivery?.status === 'Ready')
        setOrders(orders);
    }, [ordersSlice.entities]);

    useEffect(() => {
    }, [selectedRows]);

    const getCenterPoint = async () => {
        if (!data) return

        const company = await GetCompany(data);
        if (!company) return notifyError("Nenhuma empresa encontrada");

        const address = company.address;
        if (!company.address) return notifyError("Nenhuma endereço encontrada");

        const coordinates = address.coordinates;
        if (!coordinates) return notifyError("Nenhuma coordenada encontrada");

        const point = { id: company.id, lat: coordinates.latitude, lng: coordinates.longitude, label: company.trade_name } as Point;
        setCenterPoint(point);
    }

    useEffect(() => {
        getCenterPoint();
    }, [status])

    useEffect(() => {
        const newPoints: Point[] = [];
        const deliveryIDs: string[] = []
        const orderIDs: string[] = []
        const newSelectedPoints: Point[] = [];

        for (let order of orders) {
            const address = Object.assign(new Address(), order.delivery?.address);
            if (!address) continue;

            const coordinates = address.coordinates
            if (!coordinates) continue;

            const point = { id: order.id, lat: coordinates.latitude, lng: coordinates.longitude, label: address.getSmallAddress() } as Point;

            if (selectedRows.has(order.id)) {
                newSelectedPoints.push(point);
                deliveryIDs.push(order.delivery?.id || "");
                orderIDs.push(order.id || "");
            } else {
                newPoints.push(point);
            }
        }

        setSelectedDeliveryIDs(deliveryIDs);
        setSelectedOrderIDs(orderIDs);
        setSelectedPoints(newSelectedPoints);
        setPoints(newPoints);

    }, [orders, selectedRows]);

    return (
        <>
            <div className="flex justify-end items-center">
                <Refresh slice={ordersSlice} fetchItems={fetchDeliveryOrders} />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Tabela */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <CrudTable columns={DeliveryOrderColumns()} data={orders} rowSelectionType="checkbox" selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
                </div>
                {/* Mapa */}
                <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-4">
                    <Map mapId="delivery-to-ship" centerPoint={centerPoint} points={points} selectedPoints={selectedPoints} />
                </div>
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
    const deliveryDriversSlice = useSelector((state: RootState) => state.deliveryDrivers);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>();
    const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([]);
    const { data } = useSession();
    const modalHandler = useModal();

    useEffect(() => {
        if (data && Object.keys(deliveryDriversSlice.entities).length === 0) {
            dispatch(fetchDeliveryDrivers({ session: data }));
        }

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchDeliveryDrivers({ session: data }));
            }
        }, 30000); // Atualiza a cada 30 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.access_token]);

    useEffect(() => {
        setDeliveryDrivers(Object.values(deliveryDriversSlice.entities));
    }, [deliveryDriversSlice.entities]);

    const submit = async () => {
        if (!data) return

        if (deliveryIDs.length === 0) {
            notifyError('Selecione pelo menos uma entrega');
            return
        }

        if (!selectedDriver) {
            notifyError('Selecione um entregador');
            return
        };

        const deliveryOrderIds = Array.from(deliveryIDs);
        try {
            await ShipOrderDelivery(deliveryOrderIds, selectedDriver.id, data);

            if (data.user.current_company?.preferences.enable_print_order_on_ship_delivery) {
                for (let i = 0; i < orderIDs.length; i++) {
                    await printOrder({
                        orderID: orderIDs[i],
                        session: data
                    })
                }
            }

            dispatch(fetchDeliveryOrders({ session: data }));
            dispatch(fetchOrders({ session: data }));
            modalHandler.hideModal("ship-delivery");
        } catch (error: RequestError | any) {
            notifyError(error);
        }
    }

    return (
        <>
            <div className="items-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Selecione um entregador:</h3>
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

            {deliveryDrivers.length > 0 && <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={submit}>Enviar entregas</button>}
        </>
    )
}

export default DeliveryOrderToShip