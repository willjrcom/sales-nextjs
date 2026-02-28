"use client";

import RequestError from "@/app/utils/error";
import ShipOrderDelivery from "@/app/api/order-delivery/status/ship/order-delivery";
import Carousel from "@/components/carousel/carousel";
import { FaUserCircle } from 'react-icons/fa';
import { useModal } from "@/app/context/modal/context";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetAllDeliveryDrivers from '@/app/api/delivery-driver/delivery-driver';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";

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

    const { isFetching, data: deliveryDriversResponse, refetch } = useQuery({
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
            queryClient.invalidateQueries({ queryKey: ['ready-delivery-orders'] });

            if (orderIDs.length > 1) {
                notifySuccess("Entregas enviadas com sucesso");
            } else {
                notifySuccess("Entrega enviada com sucesso");
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
                    <Refresh onRefresh={handleRefresh} isFetching={isFetching} lastUpdate={lastUpdate} />
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

export default SelectDeliveryDriver;