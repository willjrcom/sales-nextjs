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
import { FaCheck, FaClipboardCheck, FaEdit, FaTimes } from "react-icons/fa";
import { useModal } from "@/app/context/modal/context";
import { useCurrentOrder } from "@/app/context/current-order/context";
import Link from "next/link";
import Carousel from "../carousel/carousel";
import CloseTable from "@/app/api/order-table/status/close/order-table";
import { fetchTableOrders } from "@/redux/slices/table-orders";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { notifyError } from "@/app/utils/notifications";
import printOrder from "@/app/components/print/print-order";
import { FaPrint } from "react-icons/fa";

interface CardOrderProps {
    orderId: string | null;
    errorRequest?: RequestError | null;
}

const CardOrder = ({ orderId, errorRequest }: CardOrderProps) => {
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);
    const dispatch = useDispatch<AppDispatch>();
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
                    </div>
                </div>
            );
        }
        if (order.table) {
            const finishTable = async () => {
                if (!order.table?.id || !data) return

                try {
                    await CloseTable(order.table?.id, data);
                    dispatch(fetchTableOrders({ session: data }));
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
                        {!order.table.closed_at && <button onClick={finishTable}
                            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Fechar Mesa</button>}
                    </div>
                </div>
            );
        }

        if (order.pickup) {
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
                                <li key={group.id} className="bg-gray-50 p-4 rounded-lg shadow-md">
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
                                    {group.items?.map((item) => (
                                        <div key={item.id} className="text-gray-700 ml-4">
                                            <p className="font-semibold">
                                                {item.quantity} x {item.name}
                                            </p>
                                            {item.observation && (
                                                <p className="italic text-sm">
                                                    Observação: {item.observation}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-gray-700">Nenhum item encontrado.</p>
                )}
            </div>

            {/* Resumo Financeiro */}
            <hr className="my-4" />
            <div className="flex justify-between items-center mb-4 mr-4">
                {/* Detalhes do Pagamento */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Pagamentos: {order.payments?.length || 0}</h3>
                    {order.payments && order.payments.length > 0 ? (
                        <ul className="space-y-4">
                            <Carousel items={order.payments}>
                                {(payment) => (
                                    <li key={payment.id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                                        <div className="text-center">
                                            <p className="text-gray-700">
                                                <strong>Método:</strong> {payment.method}
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Valor:</strong> R$ {new Decimal(payment.total_paid).toFixed(2)}
                                            </p>
                                        </div>
                                    </li>
                                )}
                            </Carousel>
                        </ul>
                    ) : (
                        <p className="text-gray-700">Nenhum pagamento registrado.</p>
                    )}
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Resumo Financeiro</h3>
                    <div className="space-y-2 text-gray-700">
                        {/* Total a Pagar */}
                        <p>
                            <span className="font-semibold">Total a Pagar:</span>{" "}
                            <span className="text-red-600">R$ {totalPayableDecimal.toFixed(2)}</span>
                        </p>

                        {/* Total Pago */}
                        <p>
                            <span className="font-semibold">Total Pago:</span>{" "}
                            <span className="text-green-600">R$ {totalPaidDecimal.toFixed(2)}</span>
                        </p>

                        {totalRestDecimal.gt(0) && (
                            <p>
                                <span className="font-semibold">Total Restante:</span>{" "}
                                <span className="text-gray-600">R$ {totalRestDecimal.toFixed(2)}</span>
                            </p>
                        )}

                        {/* Troco */}
                        {totalChangeDecimal.gt(0) && (
                            <p>
                                <span className="font-semibold">Troco:</span>{" "}
                                <span className="text-gray-600">R$ {totalChangeDecimal.toFixed(2)}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

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
                </div>
            </div>
        </div>
    );
};

export default CardOrder;
