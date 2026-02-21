import RequestError from '@/app/utils/error';
import FinishOrderProcess from '@/app/api/order-process/finish/order-process';
import StartOrderProcess from '@/app/api/order-process/start/order-process';
import { useModal } from '@/app/context/modal/context';
import OrderProcess from '@/app/entities/order-process/order-process';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { HiEye, HiPlay, HiCheckCircle } from 'react-icons/hi';
import GroupItem from '@/app/entities/order/group-item';
import OrderProcessDetails from './order-process-details';
import { ToUtcMinutesSeconds } from '@/app/utils/date';
import { notifyError } from '@/app/utils/notifications';
import printGroupItem from '@/app/components/print/print-group-item';
import GetCompany from '@/app/api/company/company';
import { useQuery } from '@tanstack/react-query';
import ItemProcessCard from './item-process-card';
import RemovedItemCard from '@/app/components/order/removed-item-card';

interface OrderProcessCardProps {
    orderProcess: OrderProcess;
    onRefetch: () => Promise<any>;
};

const OrderProcessCard = ({ orderProcess, onRefetch }: OrderProcessCardProps) => {
    const { data } = useSession();
    const modalHandler = useModal();

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(data!),
        enabled: !!data?.user?.access_token,
    })

    const [now, setNow] = useState(new Date());
    const [isProcessing, setIsProcessing] = useState(false);
    useEffect(() => {
        if (orderProcess.status === "Started") {
            const timer = setInterval(() => setNow(new Date()), 1000);
            return () => clearInterval(timer);
        }
    }, [orderProcess.status]);

    const groupItem = orderProcess.group_item;
    if (!groupItem) {
        return <p className="text-gray-500 mt-4">Nenhum item no pedido</p>
    };

    const startProcess = async (id: string) => {
        if (!data || isProcessing) return
        setIsProcessing(true);
        try {
            await StartOrderProcess(id, data)
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao iniciar o pedido');
        } finally {
            await onRefetch();
            setIsProcessing(false);
        }
    }

    const finishProcess = async (id: string) => {
        if (!data || isProcessing) return
        setIsProcessing(true);
        try {
            const nextProcessID = await FinishOrderProcess(id, data)

            if (!nextProcessID && company?.preferences?.["enable_print_items_on_finish_process"]) {
                await printGroupItem({ groupItemID: groupItem.id, printerName: groupItem.printer_name, session: data })
            }
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao finalizar o pedido');
        } finally {
            await onRefetch();
            setIsProcessing(false);
        }
    }

    const openGroupItemDetails = (groupItem: GroupItem) => {
        const onClose = () => {
            modalHandler.hideModal("group-item-details-" + groupItem.id)
        }

        modalHandler.showModal("group-item-details-" + groupItem.id, groupItem.category?.name || "Detalhes do pedido",
            <OrderProcessDetails orderProcess={orderProcess} />,
            'lg',
            onClose
        )
    }

    return (
        <div className="bg-white border shadow rounded-lg overflow-hidden mt-6">
            <div className="px-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 py-2">
                    <span className="text-gray-600 font-semibold">Pedido #{orderProcess.order_number} - {orderProcess.order_type}</span>
                    {groupItem.observation && <RemovedItemCard value={groupItem.observation} key={groupItem.observation} />}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => openGroupItemDetails(groupItem)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        <HiEye className="mr-1" /> Ver detalhes
                    </button>
                </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <ul className="space-y-2">
                        {groupItem.items.map((item) => {
                            return <ItemProcessCard item={item} key={item.id} />;
                        })}
                        {groupItem.complement_item && (
                            <ItemProcessCard item={groupItem.complement_item} key={groupItem.complement_item.id} />
                        )}
                    </ul>
                </div>
                <div className="flex flex-col justify-between items-center md:items-end">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-3xl font-bold text-gray-800">{groupItem.quantity}</p>
                    </div>
                    <div className="w-full">
                        {orderProcess.status === "Pending" && (
                            <button
                                onClick={() => startProcess(orderProcess.id)}
                                disabled={isProcessing}
                                className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded"
                            >
                                <HiPlay className="mr-2" /> {isProcessing ? 'Iniciando...' : 'Iniciar'}
                            </button>
                        )}
                        {orderProcess.status === "Started" && (
                            <button
                                onClick={() => finishProcess(orderProcess.id)}
                                disabled={isProcessing}
                                className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded"
                            >
                                <HiCheckCircle className="mr-2" /> {isProcessing ? 'Finalizando...' : 'Finalizar'}
                            </button>
                        )}
                    </div>
                    {orderProcess.status === "Started" && (
                        <p className="mt-2 text-sm text-gray-500">
                            Duração: {(() => {
                                const startAt = orderProcess.started_at
                                    ? new Date(orderProcess.started_at)
                                    : new Date();
                                const diffMs = now.getTime() - startAt.getTime();
                                const durationDate = new Date(diffMs);
                                return ToUtcMinutesSeconds(durationDate.toISOString());
                            })()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderProcessCard;
