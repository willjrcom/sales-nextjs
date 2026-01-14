import Order from "@/app/entities/order/order";
import Decimal from 'decimal.js';
import StatusComponent from "../button/show-status";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import RequestError from "@/app/utils/error";
import RoundComponent from "../button/round-component";
import { ToUtcDatetime } from "@/app/utils/date";
import ReadyOrder from "@/app/api/order/status/ready/order";
import FinishOrder from "@/app/api/order/status/finish/order";
import CancelOrder from "@/app/api/order/status/cancel/order";
import ButtonIconText from "../button/button-icon-text";
import PaymentForm from "@/app/forms/order-payment/form";
import {
    FaCheck, FaClipboardCheck, FaEdit, FaTimes, FaMoneyBillWave, FaCreditCard, FaTicketAlt, FaDollarSign, FaPrint,
    FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal, FaCcDinersClub,
    FaHourglassHalf, FaFileInvoiceDollar
} from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import { useCurrentOrder } from "@/app/context/current-order/context";
import Link from "next/link";
import Carousel from "../carousel/carousel";
import type { IconType } from 'react-icons';

// Ícones para métodos de pagamento
const paymentIcons: Record<string, IconType> = {
    Dinheiro: FaMoneyBillWave,
    Visa: FaCcVisa,
    MasterCard: FaCcMastercard,
    Ticket: FaTicketAlt,
    VR: FaDollarSign,
    "American Express": FaCcAmex,
    Elo: FaCreditCard,
    "Diners Club": FaCcDinersClub,
    Hipercard: FaCreditCard,
    "Visa Electron": FaCcVisa,
    Maestro: FaCcMastercard,
    Alelo: FaCreditCard,
    PayPal: FaCcPaypal,
    Outros: FaDollarSign,
};
const DefaultPaymentIcon = FaDollarSign;
import CloseTable from "@/app/api/order-table/status/close/order-table";
import { useQueryClient } from "@tanstack/react-query";
import { notifyError } from "@/app/utils/notifications";
import printOrder from "@/app/components/print/print-order";
import DeliveryPickup from "@/app/api/order-pickup/status/delivery/order-pickup";
import { SelectDeliveryDriver } from "@/app/pages/(user)/order-delivery-control/delivery-to-ship";
import { FinishDelivery } from "@/app/pages/(user)/order-delivery-control/delivery-to-finish";
import ObservationCard from "./observation";
import GroupItem from "@/app/entities/order/group-item";
import AdditionalItem from "@/app/components/order/additional-item";
import RemovedItem from "@/app/components/order/removed-item";
import EmitNFCeModal from "@/app/components/order/emit-nfce-modal";
import Item from "@/app/entities/order/item";

interface CardOrderProps {
    orderId: string | null;
}

const CardOrder = ({ orderId }: CardOrderProps) => {
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const [paymentView, setPaymentView] = useState<'table' | 'carousel'>('table');
    const queryClient = useQueryClient();
    const { data } = useSession();
    const modalHandler = useModal();

    const fetchOrder = async () => {
        if (!data || !orderId) return;

        try {
            await contextCurrentOrder.fetchData(orderId);
        } catch (error) {
            setOrder(null);
        }
    };

    useEffect(() => {
        setOrder(contextCurrentOrder.order);
    }, [contextCurrentOrder.order]);

    const handleReady = async () => {
        if (!order || !data) return;

        try {
            await ReadyOrder(order.id, data);
            fetchOrder();
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao marcar como pronto");
        }

        modalHandler.hideModal("ready-order-" + order.id);
    };

    const handleFinished = async () => {
        if (!order || !data) return;

        try {
            await FinishOrder(order.id, data);
            fetchOrder();
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao marcar como finalizado");
        }

        modalHandler.hideModal("finish-order-" + order.id);
    };

    const handleCancel = async () => {
        if (!order || !data) return;

        try {
            await CancelOrder(order.id, data);
            fetchOrder();
        } catch (error) {
            const err = error as RequestError;
            notifyError(err.message || "Erro ao cancelar pedido");
        }

        modalHandler.hideModal("cancel-order-" + order.id);
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    if (!order) return null;

    const isOrderStatusPending = order.status === "Pending";
    const isOrderStatusReady = order.status === "Ready";
    const isOrderStatusCanceled = order.status === "Canceled";
    const isOrderStatusFinished = order.status === "Finished";

    // Converter valores plain para Decimal
    const totalChangeDecimal = new Decimal(order.total_change);
    const totalPayableDecimal = new Decimal(order.total_payable);
    const totalPaidDecimal = new Decimal(order.total_paid);
    const totalRestDecimal = totalPayableDecimal.minus(totalPaidDecimal);

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
                <div className="text-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Detalhes da Entrega</h3>
                        <StatusComponent status={order.delivery.status} />
                    </div>
                    <p>
                        <strong>Taxa de Entrega:</strong>{" "}
                        R$ {deliveryTaxDecimal.toFixed(2) || "0.00"}
                    </p>
                    <p>
                        <strong>Cliente:</strong> {order.delivery.client?.name}
                    </p>
                    <p>
                        <strong>Endereço:</strong> {order.delivery.address?.street}, {order.delivery.address?.number}
                    </p>
                    <p>
                        <strong>Entregador:</strong>{" "}
                        {order.delivery.driver?.employee?.name || "Não atribuído"}
                    </p>
                    <div className="mt-2">
                        <p><strong>Prazos:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Pendente em: {ToUtcDatetime(order.delivery.pending_at)}</li>
                            <li>Enviado em: {ToUtcDatetime(order.delivery.shipped_at)}</li>
                            <li>Entregue em: {ToUtcDatetime(order.delivery.delivered_at)}</li>
                        </ul>

                        {order.status === "Ready" && order.delivery.status === "Ready" && <button onClick={shipDelivery}
                            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Enviar entrega</button>
                        }

                        {order.status === "Ready" && order.delivery.status === "Shipped" && <button onClick={finishDelivery}
                            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Receber entrega</button>
                        }
                    </div>
                </div>
            );
        }
        if (order.table) {
            const closeTable = async () => {
                if (!order.table?.id || !data) return

                try {
                    await CloseTable(order.table?.id, data);
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    fetchOrder();
                } catch (error) {
                    const err = error as RequestError;
                    notifyError(err.message || "Erro ao fechar mesa");
                }
            }

            return (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Detalhes da Mesa</h3>
                        <StatusComponent status={order.table.status} />
                    </div>
                    <p><strong>Mesa:</strong> {order.table.name}</p>
                    <p><strong>Contato:</strong> {order.table.contact}</p>
                    <div className="mt-2">
                        <p><strong>Prazos:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Pendente em: {ToUtcDatetime(order.table.pending_at)}</li>
                            <li>Fechado em: {ToUtcDatetime(order.table.closed_at)}</li>
                        </ul>
                        {order.table.status === "Pending" && <button onClick={closeTable}
                            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Fechar Mesa</button>
                        }
                    </div>
                </div>
            );
        }

        if (order.pickup) {
            const deliveryPickup = async () => {
                if (!order.pickup?.id || !data) return

                try {
                    await DeliveryPickup(order.pickup?.id, data);
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                    fetchOrder();
                } catch (error) {
                    const err = error as RequestError;
                    notifyError(err.message || "Erro ao entregar retirada");
                }
            }
            return (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Detalhes da Retirada</h3>
                        <StatusComponent status={order.pickup.status} />
                    </div>
                    <p><strong>Nome:</strong> {order.pickup.name}</p>
                    <div className="mt-2">
                        <p><strong>Prazos:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Pendente em: {ToUtcDatetime(order.pickup.pending_at)}</li>
                            <li>Pronto em: {ToUtcDatetime(order.pickup.ready_at)}</li>
                        </ul>

                        {order.pickup.status === "Ready" && <button onClick={deliveryPickup}
                            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Entregar pedido</button>
                        }
                    </div>
                </div>
            );
        }

        return <p className="text-gray-500">Tipo de pedido não especificado.</p>;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">

            {/* Layout Responsivo */}
            <div className="flex flex-col md:flex-row md:justify-between items-start gap-6 mb-6">
                {/* Informações Básicas */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold mb-2 text-gray-800">Informações do Pedido</h3>
                        <StatusComponent status={order?.status} />
                        <Link onClick={() => modalHandler.hideModal("show-order-" + order.id)} href={"/pages/order-control/" + order?.id}>
                            <FaEdit />
                        </Link>
                    </div>
                    <p className="text-gray-700">
                        <strong>Comanda N°:</strong> {order.order_number}
                    </p>
                    <p className="text-gray-700">
                        <strong>Tipo:</strong>{" "}
                        {order.delivery
                            ? "Delivery"
                            : order.table
                                ? "Mesa"
                                : order.pickup
                                    ? "Retirada"
                                    : "Desconhecido"}
                    </p>
                </div>

                {/* Detalhes Específicos por Tipo de Pedido */}
                <div className="flex-1 border-t md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0">
                    {renderOrderTypeDetails()}
                </div>
            </div>

            {/* Itens do Pedido */}
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Itens do Pedido</h3>
                {order.group_items?.length > 0 ? (
                    <ul className="space-y-4">
                        {order.group_items
                            .sort((a, b) => a.category_id.localeCompare(b.category_id))
                            .map((group) => (
                                <GroupItemCard group={group} key={group.id} />
                            ))}
                    </ul>
                ) : (
                    <p className="text-gray-700">Nenhum item encontrado.</p>
                )}
            </div>

            {/* Resumo Financeiro */}
            <hr className="my-4" />
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Resumo Financeiro</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center p-4 bg-white rounded-lg shadow">
                        <FaMoneyBillWave className="text-2xl text-red-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Total a Pagar</p>
                            <p className="text-lg font-semibold text-red-600">R$ {totalPayableDecimal.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-white rounded-lg shadow">
                        <FaCreditCard className="text-2xl text-green-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Total Pago</p>
                            <p className="text-lg font-semibold text-green-600">R$ {totalPaidDecimal.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-white rounded-lg shadow">
                        <FaHourglassHalf className="text-2xl text-yellow-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Total Restante</p>
                            <p className="text-lg font-semibold text-yellow-600">R$ {totalRestDecimal.gt(0) ? totalRestDecimal.toFixed(2) : '0.00'}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-white rounded-lg shadow">
                        <FaDollarSign className="text-2xl text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Troco</p>
                            <p className="text-lg font-semibold text-blue-600">R$ {totalChangeDecimal.gt(0) ? totalChangeDecimal.toFixed(2) : '0.00'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagamentos: escolha de layout */}
            {order.payments && order.payments.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                        {paymentView === 'table' ? 'Detalhes dos Pagamentos' : 'Visualização Rápida'}
                    </h4>
                    <div className="flex items-center mb-4 space-x-2">
                        <button
                            onClick={() => setPaymentView('table')}
                            className={`px-3 py-1 rounded ${paymentView === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Tabela
                        </button>
                        <button
                            onClick={() => setPaymentView('carousel')}
                            className={`px-3 py-1 rounded ${paymentView === 'carousel' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Carrossel
                        </button>
                    </div>
                    {paymentView === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left bg-white rounded-lg shadow">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">Método</th>
                                        <th className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">Valor Pago (R$)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.payments.map((payment) => (
                                        <tr key={payment.id} className="border-t">
                                            <td className="px-4 py-2 text-gray-700">{payment.method}</td>
                                            <td className="px-4 py-2 text-gray-700">R$ {new Decimal(payment.total_paid).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Carousel items={order.payments}>
                                {(payment) => {
                                    const Icon = paymentIcons[payment.method] || DefaultPaymentIcon;
                                    return (
                                        <div
                                            key={payment.id}
                                            className="flex flex-col items-center p-4 border rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition mx-2"
                                        >
                                            <Icon className="text-3xl text-gray-600 mb-2" />
                                            <p className="font-semibold text-gray-700 mb-1">{payment.method}</p>
                                            <p className="text-gray-700">R$ {new Decimal(payment.total_paid).toFixed(2)}</p>
                                        </div>
                                    );
                                }}
                            </Carousel>
                        </div>
                    )}
                </div>
            )}

            <hr className="my-4" />
            {/* Botões de Ação */}
            <div className="flex justify-between items-center gap-4">
                {!isOrderStatusCanceled && !isOrderStatusFinished && <ButtonIconText modalName="add-payment" title="Adicionar pagamento" size="md" >
                    <PaymentForm />
                </ButtonIconText>}

                {isOrderStatusFinished && <div>&nbsp;</div>}

                <div className="flex justify-end items-center gap-4">
                    {isOrderStatusPending &&
                        <ButtonIconText modalName={"ready-order-" + order.id} title="Deixar pronto" size="md" color="yellow" icon={FaCheck}>
                            <p className="mb-2">tem certeza que deseja deixar o pedido pronto?</p>
                            <button
                                onClick={handleReady}
                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-200"
                            >
                                Confirmar
                            </button>
                        </ButtonIconText>}

                    {isOrderStatusReady &&
                        <ButtonIconText modalName={"finish-order-" + order.id} title="Finalizar" size="md" color="green" icon={FaClipboardCheck}>
                            <p className="mb-2">tem certeza que deseja finalizar o pedido?</p>
                            <button
                                onClick={handleFinished}
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                            >
                                Confirmar
                            </button>
                        </ButtonIconText>}

                    {!isOrderStatusCanceled &&
                        <ButtonIconText modalName={"cancel-order-" + order.id} title="Cancelar" size="md" color="red" icon={FaTimes}>
                            <p className="mb-2">tem certeza que deseja cancelar o pedido?</p>
                            <button
                                onClick={handleCancel}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                            >
                                Confirmar
                            </button>
                        </ButtonIconText>}
                    {/* Botão de impressão */}
                    {!isOrderStatusCanceled &&
                        <button
                            onClick={() => data && printOrder({ orderID: order.id, session: data })}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                        >
                            <FaPrint />
                            <span>Imprimir</span>
                        </button>
                    }
                    {/* Botão de gerar nota fiscal */}
                    <ButtonIconText
                        modalName={"emit-nfce-" + order.id}
                        title="Gerar NFC-e"
                        size="md"
                        color="purple"
                        icon={FaFileInvoiceDollar}
                        isDisabled={!isOrderStatusFinished || isOrderStatusCanceled}
                    >
                        <EmitNFCeModal orderId={order.id} onSuccess={fetchOrder} />
                    </ButtonIconText>
                </div>
            </div>
        </div>
    );
};


interface GroupItemProps {
    group: GroupItem;
}

const GroupItemCard = ({ group }: GroupItemProps) => {
    return (
        <li key={group.id} className="bg-gray-50 p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 font-semibold">
                    <span className="ml-2">
                        <StatusComponent status={group?.status} />
                    </span>
                </p>
                <div className="flex space-x-2">
                    <RoundComponent>Qtd: {group.quantity}</RoundComponent>
                    <RoundComponent>
                        Total: R$ {new Decimal(group.total_price).toFixed(2)}
                    </RoundComponent>
                </div>
            </div>

            {group.items?.map((item) => <ItemCard item={item} key={item.id} />)}
        </li>
    )
}

interface ItemCardProps {
    item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
    return (
        <div key={item.id} className="text-gray-700 ml-4 py-2 border shadow rounded-md p-2 m-2">
            <div className="flex space-x-2 items-center justify-between">
                <p className="font-semibold">{item.quantity} x {item.name}</p>
                <RoundComponent>
                    Total: R$ {new Decimal(item.total_price).toFixed(2)}
                </RoundComponent>
            </div>

            {item.observation && <ObservationCard observation={item.observation} />}
            {item.additional_items?.map((add) => (
                <AdditionalItem item={add} key={add.id} />
            ))}
            {item.removed_items?.map((rem) => (
                <RemovedItem item={rem} key={rem} />
            ))}
        </div>
    )
}
export default CardOrder;
