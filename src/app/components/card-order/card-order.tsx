import Decimal from 'decimal.js';
import StatusComponent from "../button/show-status";
import { useState } from "react";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import { ToUtcDatetime } from "@/app/utils/date";
import ReadyOrder from "@/app/api/order/status/ready/order";
import FinishOrder from "@/app/api/order/status/finish/order";
import CancelOrder from "@/app/api/order/status/cancel/order";
import ButtonIconText from "../button/button-icon-text";
import PaymentForm from "@/app/forms/order-payment/form";
import { useModal } from "@/app/context/modal/context";
import Refresh from "@/app/components/crud/refresh";
import Link from "next/link";
import Carousel from "../../../components/carousel/carousel";
import CloseTable from "@/app/api/order-table/status/close/order-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import printOrder from "@/app/components/print/print-order";
import DeliveryPickup from "@/app/api/order-pickup/status/delivery/order-pickup";
import { SelectDeliveryDriver } from "@/app/pages/(user)/order-delivery-control/delivery-to-ship";
import { FinishDelivery } from "@/app/pages/(user)/order-delivery-control/delivery-to-finish";
import EmitNFCeModal from "@/app/components/card-order/emit-nfce-modal";
import GetOrderByID from "@/app/api/order/[id]/order";
import GroupItemCard from "./group-item-card";
import { getFiscalSettings } from "@/app/api/fiscal-settings/fiscal-settings";
import {
    Check,
    ClipboardCheck,
    Edit,
    X,
    DollarSign,
    CreditCard,
    Ticket,
    Printer,
    FileText,
    Hourglass,
    ChevronDown,
    ChevronUp,
    Bike,
    Utensils,
    Package,
    Clock,
    ShoppingBag,
    User,
    Calendar,
    MapPin,
    Phone,
    Truck,
    Wallet,
    Info,
    RotateCw,
    AlertCircle,
    LayoutGrid,
    Search,
    Receipt,
    History
} from "lucide-react";
import GetCompany from '@/app/api/company/company';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPhone } from "@/app/utils/format";

// Ícones para métodos de pagamento
const paymentIcons: Record<string, any> = {
    Dinheiro: DollarSign,
    Visa: CreditCard,
    MasterCard: CreditCard,
    Ticket: Ticket,
    VR: Wallet,
    "American Express": CreditCard,
    Elo: CreditCard,
    "Diners Club": CreditCard,
    Hipercard: CreditCard,
    "Visa Electron": CreditCard,
    Maestro: CreditCard,
    Alelo: CreditCard,
    PayPal: CreditCard,
    Outros: DollarSign,
};

const DefaultPaymentIcon = DollarSign;

interface CardOrderProps {
    orderId: string | null;
    editBlocked?: boolean;
}

export default function CardOrder({ orderId, editBlocked = false }: CardOrderProps) {
    const [paymentView, setPaymentView] = useState<'table' | 'carousel'>('table');
    const queryClient = useQueryClient();
    const { data, status } = useSession();
    const isAuthenticating = status === "loading";
    const [isProcessing, setIsProcessing] = useState(false);
    const modalHandler = useModal();
    const accessToken = data?.user?.access_token || data?.access_token;

    const { data: company } = useQuery({
        queryKey: ['company'],
        queryFn: () => GetCompany(data!),
        enabled: !isAuthenticating && !!accessToken,
    })

    const { data: fiscalSettings } = useQuery({
        queryKey: ['fiscal-settings'],
        queryFn: () => getFiscalSettings(data!),
        enabled: !isAuthenticating && !!accessToken,
    });

    const { isLoading, data: order, refetch } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => {
            return GetOrderByID(orderId!, data!);
        },
        enabled: !!orderId && !isAuthenticating && !!accessToken,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0,

    });

    const handleReady = async () => {
        if (!order || !data || isProcessing) return;
        setIsProcessing(true);
        try {
            await ReadyOrder(order.id, data);
            refetch();
            modalHandler.hideModal("ready-order-" + order.id);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao marcar como pronto");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinished = async () => {
        if (!order || !data || isProcessing) return;
        setIsProcessing(true);
        try {
            await FinishOrder(order.id, data);
            refetch();
            modalHandler.hideModal("finish-order-" + order.id);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao marcar como finalizado");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!order || !data || isProcessing) return;
        setIsProcessing(true);
        try {
            await CancelOrder(order.id, data);
            refetch();
            modalHandler.hideModal("cancel-order-" + order.id);
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao cancelar pedido");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading || isAuthenticating) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!order) return null;

    const isOrderStatusPending = order.status === "Pending";
    const isOrderStatusReady = order.status === "Ready";
    const isOrderStatusCancelled = order.status === "Cancelled";
    const isOrderStatusFinished = order.status === "Finished";

    // Converter valores plain para Decimal
    const totalChangeDecimal = new Decimal(order.total_change);
    const totalDecimal = new Decimal(order.total);
    const totalPaidDecimal = new Decimal(order.total_paid);
    const totalRestDecimal = totalDecimal.minus(totalPaidDecimal);

    const renderOrderTypeDetails = () => {
        if (order.delivery) {
            const deliveryTaxDecimal = new Decimal(order.delivery.delivery_tax || "0");

            const shipDelivery = () => {
                const onClose = () => {
                    modalHandler.hideModal('ship-delivery');
                }

                modalHandler.showModal(
                    'ship-delivery', 'Enviar entrega',
                    <SelectDeliveryDriver deliveryIDs={[order.delivery!.id]} orderIDs={[order.id]} />,
                    'md',
                    onClose,
                )
            }

            const finishDelivery = () => {
                const onClose = () => {
                    modalHandler.hideModal('finish-delivery');
                }
                modalHandler.showModal(
                    'finish-delivery', 'Receber entrega',
                    <FinishDelivery order={order} />,
                    'md',
                    onClose,
                )
            }


            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                <Bike className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Detalhes da Entrega</h3>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black">
                            {order.delivery.status === "Ready" ? "Pronto para Envio" : order.delivery.status === "Shipped" ? "Em Transporte" : order.delivery.status === "Delivered" ? "Entregue" : "Pendente"}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Cliente</span>
                                <p className="text-gray-800 font-black ml-auto">{order.delivery.client?.name}</p>
                            </div>
                            {order.delivery.client?.contact?.number && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Contato</span>
                                    <p className="text-gray-800 font-black ml-auto">{formatPhone(order.delivery.client.contact.number)}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Endereço</span>
                                <p className="text-gray-800 font-black truncate ml-auto text-right max-w-[150px]">
                                    {order.delivery.address?.street}, {order.delivery.address?.number}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Truck className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Entregador</span>
                                <p className="text-gray-800 font-black ml-auto">
                                    {order.delivery.driver?.employee?.name || "Não atribuído"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Taxa</span>
                                <p className="text-emerald-600 font-black ml-auto">{formatCurrency(Number(deliveryTaxDecimal.toFixed(2)))}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Pendente em</span>
                                <p className="text-gray-800 font-black ml-auto">{ToUtcDatetime(order.delivery.pending_at)}</p>
                            </div>
                            {totalChangeDecimal.gt(0) && (
                                <div className="flex items-center gap-2 text-sm p-2 bg-amber-100/50 rounded-xl border border-amber-100">
                                    <Wallet className="w-4 h-4 text-amber-600" />
                                    <span className="text-amber-700 font-bold uppercase text-[10px] tracking-widest">Levar Troco</span>
                                    <p className="text-amber-700 font-black ml-auto">{formatCurrency(Number(totalChangeDecimal.toFixed(2)))}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest h-8 hover:bg-gray-100">
                                <div className="flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" />
                                    Ver Histórico de Prazos
                                </div>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                            <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
                                {order.delivery.ready_at && (
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-400 font-bold uppercase">Pronto:</span>
                                        <span className="text-gray-600 font-black">{ToUtcDatetime(order.delivery.ready_at)}</span>
                                    </div>
                                )}
                                {order.delivery.shipped_at && (
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-400 font-bold uppercase">Enviado:</span>
                                        <span className="text-gray-600 font-black">{ToUtcDatetime(order.delivery.shipped_at)}</span>
                                    </div>
                                )}
                                {order.delivery.delivered_at && (
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-gray-400 font-bold uppercase">Entregue:</span>
                                        <span className="text-gray-600 font-black">{ToUtcDatetime(order.delivery.delivered_at)}</span>
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {!editBlocked && order.status === "Ready" && (
                        <div className="pt-2">
                            {order.delivery.status === "Ready" && (
                                <Button onClick={shipDelivery} className="w-full bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest gap-2 shadow-lg shadow-blue-100">
                                    <Truck className="w-4 h-4" />
                                    Enviar Entrega
                                </Button>
                            )}
                            {order.delivery.status === "Shipped" && (
                                <Button onClick={finishDelivery} className="w-full bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100">
                                    <Check className="w-4 h-4" />
                                    Receber Entrega
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        if (order.table) {
            const closeTable = async () => {
                if (!order.table?.id || !data || isProcessing) return
                setIsProcessing(true);
                try {
                    await CloseTable(order.table?.id, data);
                    queryClient.invalidateQueries({ queryKey: ['table-orders'] });
                    refetch();
                } catch (error) {
                    const err = error as RequestError;
                    notifyError(err.message || "Erro ao fechar mesa");
                } finally {
                    setIsProcessing(false);
                }
            }

            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Detalhes da Mesa</h3>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-black">
                            {order.table.status === "Pending" ? "Ocupada" : order.table.status === "Closed" ? "Fechada" : "Cancelada"}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <LayoutGrid className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Mesa</span>
                                <p className="text-gray-800 font-black ml-auto">{order.table.table?.name}</p>
                            </div>
                            {order.table.name && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Responsável</span>
                                    <p className="text-gray-800 font-black ml-auto">{order.table.name}</p>
                                </div>
                            )}
                            {order.table.contact && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Contato</span>
                                    <p className="text-gray-800 font-black ml-auto">{formatPhone(order.table.contact)}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Aberta em</span>
                                <p className="text-gray-800 font-black ml-auto">{ToUtcDatetime(order.table.pending_at)}</p>
                            </div>
                            {order.ready_at && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Pronto em</span>
                                    <p className="text-gray-800 font-black ml-auto">{ToUtcDatetime(order.ready_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!editBlocked && order.table.status === "Pending" && (
                        <div className="pt-2">
                            <Button
                                onClick={() => {
                                    const onConfirm = async () => {
                                        try {
                                            await closeTable();
                                            modalHandler.hideModal('close-table-' + order.id);
                                        } catch (error) {
                                            const err = error as RequestError;
                                            notifyError(err.message || "Erro ao fechar mesa");
                                        }
                                    }
                                    modalHandler.showModal(
                                        'close-table-' + order.id,
                                        'Fechar Mesa',
                                        <div className="space-y-6 py-4">
                                            <div className="text-center space-y-2">
                                                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <AlertCircle className="w-8 h-8" />
                                                </div>
                                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Fechar Mesa?</h2>
                                                <p className="text-gray-500 font-medium">Esta ação marcará a mesa {order.table?.table?.name} como concluída e pronta para pagamento.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button variant="outline" className="flex-1 font-bold uppercase tracking-widest" onClick={() => modalHandler.hideModal('close-table-' + order.id)}>
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    disabled={isProcessing}
                                                    className="flex-1 bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-widest"
                                                    onClick={onConfirm}
                                                >
                                                    {isProcessing ? 'Fechando...' : 'Confirmar Fechamento'}
                                                </Button>
                                            </div>
                                        </div>,
                                        'md',
                                        () => modalHandler.hideModal('close-table-' + order.id)
                                    )
                                }}
                                className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-black uppercase tracking-widest gap-2"
                            >
                                <X className="w-4 h-4" />
                                Fechar Mesa
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        if (order.pickup) {
            const deliveryPickup = async () => {
                if (!order.pickup?.id || !data || isProcessing) return
                setIsProcessing(true);
                try {
                    await DeliveryPickup(order.pickup?.id, data);
                    queryClient.invalidateQueries({ queryKey: ['pickup-orders-ready'] });
                    queryClient.invalidateQueries({ queryKey: ['pickup-orders-delivered'] });
                    refetch();
                } catch (error) {
                    const err = error as RequestError;
                    notifyError(err.message || "Erro ao entregar retirada");
                } finally {
                    setIsProcessing(false);
                }
            }

            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                                <Package className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Detalhes da Retirada</h3>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 font-black">
                            {order.pickup.status === "Pending" ? "Pendente" : order.pickup.status === "Ready" ? "Pronto" : order.pickup.status === "Delivered" ? "Entregue" : "Cancelado"}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="space-y-3">
                            {order.pickup.name && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Cliente</span>
                                    <p className="text-gray-800 font-black ml-auto">{order.pickup.name}</p>
                                </div>
                            )}
                            {order.pickup.contact && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Contato</span>
                                    <p className="text-gray-800 font-black ml-auto">{formatPhone(order.pickup.contact)}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-purple-500" />
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Pendente em</span>
                                <p className="text-gray-800 font-black ml-auto">{ToUtcDatetime(order.pickup.pending_at)}</p>
                            </div>
                            {order.pickup.ready_at && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Pronto em</span>
                                    <p className="text-gray-800 font-black ml-auto">{ToUtcDatetime(order.pickup.ready_at)}</p>
                                </div>
                            )}
                            {order.pickup.delivered_at && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Entregue em</span>
                                    <p className="text-gray-800 font-black ml-auto">{ToUtcDatetime(order.pickup.delivered_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!editBlocked && order.pickup.status === "Ready" && (
                        <div className="pt-2">
                            <Button
                                onClick={() => {
                                    const onConfirm = async () => {
                                        try {
                                            await deliveryPickup();
                                            modalHandler.hideModal('delivery-pickup-' + order.id);
                                        } catch (error) {
                                            const err = error as RequestError;
                                            notifyError(err.message || "Erro ao entregar retirada");
                                        }
                                    }
                                    modalHandler.showModal(
                                        'delivery-pickup-' + order.id,
                                        'Entregar Pedido',
                                        <div className="space-y-6 py-4">
                                            <div className="text-center space-y-2">
                                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <ShoppingBag className="w-8 h-8" />
                                                </div>
                                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Entregar Pedido?</h2>
                                                <p className="text-gray-500 font-medium">Confirma que o pedido foi retirado pelo cliente?</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button variant="outline" className="flex-1 font-bold uppercase tracking-widest" onClick={() => modalHandler.hideModal('delivery-pickup-' + order.id)}>
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    disabled={isProcessing}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest"
                                                    onClick={onConfirm}
                                                >
                                                    {isProcessing ? 'Entregando...' : 'Confirmar Retirada'}
                                                </Button>
                                            </div>
                                        </div>,
                                        'md',
                                        () => modalHandler.hideModal('delivery-pickup-' + order.id)
                                    )
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Confirmar Retirada
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        return <p className="text-gray-500">Tipo de pedido não especificado.</p>;
    };

    return (
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b pb-8 pt-8 px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black px-3 py-1 rounded-lg">
                                #{order.order_number}
                            </Badge>
                            <StatusComponent status={order?.status} />
                        </div>
                        <CardTitle className="text-3xl font-black text-gray-900 tracking-tight mt-2 flex items-center gap-3">
                            Pedido de {order.delivery ? 'Entrega' : order.table ? 'Mesa' : 'Retirada'}
                            {!editBlocked && order.status !== 'Finished' && order.status !== 'Cancelled' && (
                                <Link
                                    onClick={() => modalHandler.hideModal("show-order-" + order.id)}
                                    href={"/pages/order-control/" + order?.id}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-blue-600"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>
                            )}
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Coluna Esquerda: Detalhes e Finanças */}
                    <div className="lg:col-span-12 space-y-12">
                        {/* Seção Superior: Detalhes do Tipo de Pedido */}
                        <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
                            {renderOrderTypeDetails()}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Itens do Pedido */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Itens do Pedido</h3>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-gray-400 hover:text-emerald-600 rounded-xl">
                                        <RotateCw className="w-4 h-4" />
                                    </Button>
                                </div>
                                <ScrollArea className="h-[400px] w-full pr-4">
                                    {order.group_items?.length > 0 ? (
                                        <ul className="space-y-4">
                                            {order.group_items
                                                .sort((a: any, b: any) => a.category_id.localeCompare(b.category_id))
                                                .map((group: any) => (
                                                    <GroupItemCard key={group.id} group={group} session={data!} />
                                                ))}
                                        </ul>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 py-12 bg-gray-50/50 rounded-3xl border border-dashed">
                                            <ShoppingBag className="w-12 h-12 opacity-20" />
                                            <p className="font-bold uppercase text-xs tracking-widest">Nenhum item</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* Resumo Financeiro */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Resumo Financeiro</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</p>
                                        <p className="text-lg font-black text-gray-700">{formatCurrency(Number(order.sub_total || 0))}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 space-y-1">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total</p>
                                        <p className="text-lg font-black text-emerald-700">{formatCurrency(Number(totalDecimal.toFixed(2)))}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-[1.5rem] border border-blue-100 space-y-1">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pago</p>
                                        <p className="text-lg font-black text-blue-700">{formatCurrency(Number(totalPaidDecimal.toFixed(2)))}</p>
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-[1.5rem] border space-y-1",
                                        totalRestDecimal.gt(0) ? "bg-amber-50 border-amber-100" : "bg-gray-50/50 border-gray-100"
                                    )}>
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            totalRestDecimal.gt(0) ? "text-amber-600" : "text-gray-400"
                                        )}>Restante</p>
                                        <p className={cn(
                                            "text-lg font-black",
                                            totalRestDecimal.gt(0) ? "text-amber-700" : "text-gray-700"
                                        )}>{formatCurrency(Number(totalRestDecimal.gt(0) ? totalRestDecimal.toFixed(2) : '0.00'))}</p>
                                    </div>
                                    {totalChangeDecimal.gt(0) && (
                                        <div className="p-4 bg-amber-100 rounded-[1.5rem] border border-amber-200 shadow-sm space-y-1 col-span-2">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-4 h-4 text-amber-700" />
                                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Troco para Levar</p>
                                            </div>
                                            <p className="text-2xl font-black text-amber-800">{formatCurrency(Number(totalChangeDecimal.toFixed(2)))}</p>
                                        </div>
                                    )}
                                </div>

                                {order.fees && order.fees.length > 0 && (
                                    <div className="bg-gray-50/50 p-4 rounded-[1.5rem] border border-gray-100 space-y-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Taxas Adicionais</p>
                                        <div className="space-y-2">
                                            {order.fees.map((fee, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white/50 p-2 px-3 rounded-xl border border-gray-100 shadow-sm">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                                                        {fee.name === 'delivery_fee' ? 'Taxa de entrega' : fee.name === 'table_tax' ? 'Taxa de serviço' : fee.name}
                                                    </span>
                                                    <span className="text-sm font-black text-gray-800">{formatCurrency(Number(fee.value))}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagamentos: escolha de layout */}
                {order.payments && order.payments.length > 0 && (
                    <div className="mt-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Pagamentos Efetuados</h3>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <Button
                                    variant={paymentView === 'table' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setPaymentView('table')}
                                    className={cn("text-[10px] font-black uppercase tracking-widest rounded-lg h-7 px-3", paymentView === 'table' && "bg-white shadow-sm")}
                                >
                                    Tabela
                                </Button>
                                <Button
                                    variant={paymentView === 'carousel' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setPaymentView('carousel')}
                                    className={cn("text-[10px] font-black uppercase tracking-widest rounded-lg h-7 px-3", paymentView === 'carousel' && "bg-white shadow-sm")}
                                >
                                    Carrossel
                                </Button>
                            </div>
                        </div>

                        {paymentView === 'table' ? (
                            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-2">
                                <ScrollArea className="h-auto max-h-[250px] w-full">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Método</th>
                                                <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor Pago</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {order.payments.map((payment: any) => (
                                                <tr key={payment.id} className="hover:bg-white/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                const Icon = paymentIcons[payment.method] || DefaultPaymentIcon;
                                                                return <Icon className="w-4 h-4 text-gray-400" />;
                                                            })()}
                                                            <span className="text-sm font-bold text-gray-700">{payment.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm font-black text-gray-900">{formatCurrency(Number(payment.total_paid))}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="overflow-x-auto pb-4">
                                <Carousel items={order.payments}>
                                    {(payment: any) => {
                                        const Icon = paymentIcons[payment.method] || DefaultPaymentIcon;
                                        return (
                                            <div
                                                key={payment.id}
                                                className="flex flex-col items-center p-6 border border-gray-100 rounded-[2rem] bg-white shadow-sm hover:shadow-md transition mx-2 min-w-[150px]"
                                            >
                                                <div className="p-3 bg-gray-50 rounded-2xl mb-3 text-gray-400">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{payment.method}</p>
                                                <p className="text-lg font-black text-gray-900">{formatCurrency(Number(payment.total_paid))}</p>
                                            </div>
                                        );
                                    }}
                                </Carousel>
                            </div>
                        )}
                    </div>
                )}

                <div className="my-12">
                    <Separator className="bg-gray-100" />
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {!editBlocked && !isOrderStatusCancelled && !isOrderStatusFinished && (
                        <ButtonIconText modalName="add-payment" title="Adicionar pagamento" size="md" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest h-12 px-8 rounded-2xl shadow-lg shadow-blue-100">
                            <PaymentForm orderId={order.id} />
                        </ButtonIconText>
                    )}

                    <div className="flex flex-wrap items-center gap-3 ml-auto w-full md:w-auto">
                        {!editBlocked && isOrderStatusPending && (
                            <ButtonIconText modalName={"ready-order-" + order.id} title="Deixar Pronto" size="md" color="yellow" icon={Check} className="flex-1 md:flex-none">
                                <div className="space-y-6 py-4">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Clock className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Deixar Pronto?</h2>
                                        <p className="text-gray-500 font-medium">Confirma que o pedido #${order.order_number} está pronto?</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 font-bold uppercase tracking-widest" onClick={() => modalHandler.hideModal("ready-order-" + order.id)}>
                                            Voltar
                                        </Button>
                                        <Button
                                            disabled={isProcessing}
                                            className="flex-1 bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-widest"
                                            onClick={handleReady}
                                        >
                                            {isProcessing ? 'Processando...' : 'Confirmar'}
                                        </Button>
                                    </div>
                                </div>
                            </ButtonIconText>
                        )}

                        {!editBlocked && isOrderStatusReady && (
                            <ButtonIconText modalName={"finish-order-" + order.id} title="Finalizar" size="md" color="green" icon={ClipboardCheck} className="flex-1 md:flex-none">
                                <div className="space-y-6 py-4">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Finalizar Pedido?</h2>
                                        <p className="text-gray-500 font-medium">Esta ação concluirá o pedido #${order.order_number}.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 font-bold uppercase tracking-widest" onClick={() => modalHandler.hideModal("finish-order-" + order.id)}>
                                            Voltar
                                        </Button>
                                        <Button
                                            disabled={isProcessing}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest"
                                            onClick={handleFinished}
                                        >
                                            {isProcessing ? 'Processando...' : 'Concluir'}
                                        </Button>
                                    </div>
                                </div>
                            </ButtonIconText>
                        )}

                        {!editBlocked && !isOrderStatusCancelled && (
                            <ButtonIconText modalName={"cancel-order-" + order.id} title="Cancelar" size="md" color="red" icon={X} className="flex-1 md:flex-none">
                                <div className="space-y-6 py-4">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight text-red-600">Cancelar Pedido?</h2>
                                        <p className="text-gray-500 font-medium">Esta ação não pode ser desfeita. Deseja realmente cancelar?</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1 font-bold uppercase tracking-widest" onClick={() => modalHandler.hideModal("cancel-order-" + order.id)}>
                                            Voltar
                                        </Button>
                                        <Button
                                            disabled={isProcessing}
                                            className="flex-1 bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest"
                                            onClick={handleCancel}
                                        >
                                            {isProcessing ? 'Cancelando...' : 'Confirmar'}
                                        </Button>
                                    </div>
                                </div>
                            </ButtonIconText>
                        )}

                        {!isOrderStatusCancelled && company && (
                            <Button
                                onClick={() => data && printOrder({ orderID: order.id, session: data })}
                                variant="outline"
                                className="flex-1 md:flex-none h-12 px-6 rounded-2xl font-black uppercase tracking-widest gap-2 bg-white border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                            >
                                <Printer className="w-4 h-4 text-gray-400" />
                                <span>Imprimir</span>
                            </Button>
                        )}

                        {fiscalSettings?.fiscal_enabled && (
                            <ButtonIconText
                                modalName={"emit-nfce-" + order.id}
                                title="Gerar NFC-e"
                                size="md"
                                color="purple"
                                icon={Receipt}
                                isDisabled={!isOrderStatusFinished || isOrderStatusCancelled}
                                className="flex-1 md:flex-none"
                            >
                                <EmitNFCeModal orderId={order.id} onSuccess={refetch} />
                            </ButtonIconText>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};