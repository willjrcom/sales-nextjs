"use client";

import RequestError from "@/app/utils/error";
import ShipOrderDelivery from "@/app/api/order-delivery/status/ship/order-delivery";
import Carousel from "@/components/carousel/carousel";
import { FaUserCircle } from 'react-icons/fa';
import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/app/context/modal/context";
import DeliveryDriver from "@/app/entities/delivery-driver/delivery-driver";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GetAllDeliveryDrivers from '@/app/api/delivery-driver/delivery-driver';
import Refresh, { FormatRefreshTime } from "@/app/components/crud/refresh";
import { cn } from "@/lib/utils";

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
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Enviar Entregas</h2>
                <p className="text-gray-500 font-medium select-none">Selecione o entregador para as {deliveryIDs.length} {deliveryIDs.length === 1 ? 'entrega' : 'entregas'} selecionadas.</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Entregadores Disponíveis</h3>
                    <Refresh onRefresh={handleRefresh} isFetching={isFetching} lastUpdate={lastUpdate} />
                </div>

                {deliveryDrivers.length === 0 && !isFetching && (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhum entregador cadastrado</p>
                    </div>
                )}

                <Carousel items={deliveryDrivers}>
                    {(driver) => {
                        const isSelected = selectedDriver?.id === driver.id;
                        return (
                            <div
                                key={driver.id}
                                className={cn(
                                    "flex flex-col items-center p-6 border-2 rounded-[2rem] cursor-pointer transition-all duration-300 relative group",
                                    isSelected
                                        ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-100/50 scale-[1.02]"
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md hover:scale-[1.01]"
                                )}
                                onClick={() => setSelectedDriver(driver)}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors overflow-hidden",
                                    isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                )}>
                                    {driver.employee.image_path ? (
                                        <img
                                            src={driver.employee.image_path}
                                            alt={driver.employee.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUserCircle className="text-2xl" />
                                    )}
                                </div>
                                <p className={cn(
                                    "font-black uppercase tracking-tight text-center leading-tight",
                                    isSelected ? "text-blue-700" : "text-gray-700"
                                )}>
                                    {driver.employee.name}
                                </p>
                                {/* <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5">
                                    <Truck className="w-3 h-3 text-gray-400" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                                        {driver.order_deliveries?.length || 0}
                                    </span>
                                </div> */}
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 animate-in zoom-in duration-300">
                                        <Truck className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        );
                    }}
                </Carousel>
            </div>

            <Button
                onClick={submit}
                disabled={isProcessing || !selectedDriver}
                className="w-full bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest h-14 rounded-2xl gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Truck className="w-6 h-6" />}
                {isProcessing ? 'Enviando...' : `Enviar ${deliveryIDs.length === 1 ? 'Entrega' : 'Entregas'}`}
            </Button>
        </div>
    );
};

export default SelectDeliveryDriver;