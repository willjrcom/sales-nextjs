import RequestError from '../../../../../../utils/error';
import FinishOrderProcess from '../../../../../../api/order-process/finish/order-process';
import StartOrderProcess from '../../../../../../api/order-process/start/order-process';
import { useModal } from '../../../../../../context/modal/context';
import OrderProcess from '../../../../../../entities/order-process/order-process';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
    Eye,
    Play,
    CheckCircle,
    Clock,
    Hash,
    MessageSquare,
    Package
} from 'lucide-react';
import GroupItem from '../../../../../../entities/order/group-item';
import OrderProcessDetails from './order-process-details';
import { ToUtcMinutesSeconds } from '../../../../../../utils/date';
import { notifyError } from '../../../../../../utils/notifications';
import printGroupItem from '../../../../../../components/print/print-group-item';
import GetCompany from '../../../../../../api/company/company';
import { useQuery } from '@tanstack/react-query';
import ItemProcessCard from './item-process-card';
import { Card, CardContent } from "../../../../../../../components/ui/card";
import { Badge } from "../../../../../../../components/ui/badge";
import { Button } from "../../../../../../../components/ui/button";
import { cn } from "../../../../../../../lib/utils";

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
        return <p className="text-gray-500 mt-4 text-center italic text-sm">Nenhum item no pedido</p>
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
                await printGroupItem({ groupItemID: groupItem.id, session: data })
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

        modalHandler.showModal("group-item-details-" + groupItem.id, "Pedido " + orderProcess.order_number,
            <OrderProcessDetails orderProcess={orderProcess} />,
            'lg',
            onClose
        )
    }

    return (
        <Card className="overflow-hidden mt-4 border-none shadow-md transition-shadow hover:shadow-lg bg-gray-100">
            <CardContent className="p-0">
                {/* Header section with integrated total */}
                <div className="flex justify-between items-center bg-white border-b border-gray-100 p-3 px-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-50 p-1.5 rounded-md border border-gray-100">
                            <Hash className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-sm font-bold text-gray-800">Pedido #{orderProcess.order_number}</span>
                            <Badge variant="secondary" className="bg-gray-100 text-[10px] text-gray-500 font-bold px-1.5 h-4.5 border-none shadow-none">
                                {orderProcess.order_type}
                            </Badge>
                            <Badge className="bg-indigo-600 text-[10px] text-white font-extrabold px-1.5 h-4.5 border-none shadow-sm">
                                Total de itens: {groupItem.quantity}
                            </Badge>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs"
                            onClick={() => openGroupItemDetails(groupItem)}
                        >
                            <Eye className="w-4 h-4 mr-1.5" /> Ver Detalhes
                        </Button>
                    </div>
                </div>

                {/* Sub-header for group observation */}
                {groupItem.observation && (
                    <div className="px-4 py-2 bg-red-100 border-b border-red-100 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[11px] font-bold text-red-900 leading-tight italic line-clamp-1">
                            "{groupItem.observation}"
                        </span>
                    </div>
                )}

                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Item List */}
                    <div className="md:col-span-3 space-y-2">
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Itens do Pedido</span>
                        </div>
                        <ul className="space-y-2">
                            {groupItem.items.map((item) => (
                                <ItemProcessCard item={item} key={item.id} />
                            ))}
                            {groupItem.complement_item && (
                                <ItemProcessCard
                                    item={groupItem.complement_item}
                                    key={groupItem.complement_item.id}
                                    isComplement={true}
                                />
                            )}
                        </ul>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                        <div className="w-full space-y-3">
                            {orderProcess.status === "Started" && (
                                <div className="text-center md:text-right space-y-1">
                                    <div className="flex items-center justify-center md:justify-end gap-1.5 text-amber-600">
                                        <Clock className="w-3 h-3 animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Em produção</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 tracking-tighter">
                                        {(() => {
                                            const startAt = orderProcess.started_at
                                                ? new Date(orderProcess.started_at)
                                                : new Date();
                                            const diffMs = now.getTime() - startAt.getTime();
                                            const durationDate = new Date(diffMs);
                                            return ToUtcMinutesSeconds(durationDate.toISOString());
                                        })()}
                                    </p>
                                </div>
                            )}

                            <div className="w-full">
                                {orderProcess.status === "Pending" && (
                                    <Button
                                        onClick={() => startProcess(orderProcess.id)}
                                        disabled={isProcessing}
                                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        <Play className="w-4 h-4 mr-2 fill-current" />
                                        {isProcessing ? 'Iniciando...' : 'Iniciar Produção'}
                                    </Button>
                                )}
                                {orderProcess.status === "Started" && (
                                    <Button
                                        onClick={() => finishProcess(orderProcess.id)}
                                        disabled={isProcessing}
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {isProcessing ? 'Finalizando...' : 'Concluir Pedido'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderProcessCard;
