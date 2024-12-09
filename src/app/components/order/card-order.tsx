import Order from "@/app/entities/order/order";
import StatusComponent from "../button/show-status";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import GetOrderByID from "@/app/api/order/[id]/route";
import RequestError from "@/app/api/error";
import RoundComponent from "../button/round-component";
import { ToUtcDate, ToUtcDatetime } from "@/app/utils/date";

interface CardOrderProps {
    orderId: string | null;
}

const CardOrder = ({ orderId }: CardOrderProps) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    const fetchOrder = async () => {
        if (!data || !orderId) return;

        try {
            const orderFound = await GetOrderByID(orderId, data);
            setOrder(orderFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
            setOrder(null);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    if (error) return <p className="mb-4 text-red-500">{error.message}</p>;
    if (!order) return null;

    const renderOrderTypeDetails = () => {
        if (order.delivery) {
            return (
                <div className="text-gray-700">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Detalhes da Entrega</h3>
                    <p>
                        <strong>Status da Entrega:</strong>{" "}
                        <StatusComponent status={order.delivery.status} />
                    </p>
                    <p>
                        <strong>Taxa de Entrega:</strong>{" "}
                        R$ {order.delivery.delivery_tax?.toFixed(2) || "0.00"}
                    </p>
                    <p>
                        <strong>Cliente:</strong> {order.delivery.client?.name}
                    </p>
                    <p>
                        <strong>Endereço:</strong> {order.delivery.address?.street}, {order.delivery.address?.number}
                    </p>
                    <p>
                        <strong>Entregador:</strong>{" "}
                        {order.delivery.driver?.name || "Não atribuído"}
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
            return (
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Detalhes da Mesa</h3>
                    <p><strong>Mesa:</strong> {order.table.name}</p>
                    <p><strong>Contato:</strong> {order.table.contact}</p>
                    <p><strong>Status da Mesa:</strong> <StatusComponent status={order.table.status} /></p>
                    <div className="mt-2">
                        <p><strong>Prazos:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Pendente em: {ToUtcDatetime(order.table.pending_at)}</li>
                            <li>Fechado em: {ToUtcDatetime(order.table.closed_at)}</li>
                        </ul>
                    </div>
                </div>
            );
        }

        if (order.pickup) {
            return (
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Detalhes da Retirada</h3>
                    <p><strong>Nome:</strong> {order.pickup.name}</p>
                    <p><strong>Status:</strong> <StatusComponent status={order.pickup.status} /></p>
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
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">Informações do Pedido</h3>
                    <p className="text-gray-700">
                        <strong>Comanda N°:</strong> {order.order_number}
                    </p>
                    <p className="text-gray-700 flex items-center">
                        <strong>Status:</strong>{" "}
                        <StatusComponent status={order?.status} />
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
                {order.groups.length > 0 ? (
                    <ul className="space-y-4">
                        {order.groups
                            .sort((a, b) => a.category_id.localeCompare(b.category_id))
                            .map((group) => (
                                <li key={group.id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-gray-700 font-semibold">
                                            <strong>Grupo:</strong>
                                            <span className="ml-2">
                                                <StatusComponent status={group?.status} />
                                            </span>
                                        </p>
                                        <div className="flex space-x-2">
                                            <RoundComponent>Qtd: {group.quantity}</RoundComponent>
                                            <RoundComponent>
                                                Total: R$ {group.total_price.toFixed(2)}
                                            </RoundComponent>
                                        </div>
                                    </div>
                                    {group.items.map((item) => (
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

            {/* Detalhes do Pedido */}
            <div className="mb-4">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Detalhes</h3>
                <div className="space-y-2 text-gray-700">
                    <p>
                        <span className="font-semibold">Total a Pagar:</span>{" "}
                        <span className="text-green-600">R$ {order.total_payable.toFixed(2)}</span>
                    </p>
                    <p>
                        <span className="font-semibold">Total Pago:</span>{" "}
                        <span className="text-blue-600">R$ {order.total_paid.toFixed(2)}</span>
                    </p>
                    <p>
                        <span className="font-semibold">Troco:</span> R$ {order.total_change.toFixed(2)}
                    </p>
                    <p className="flex justify-between items-center">
                        <span>
                            <span className="font-semibold">Observação:</span>{" "}
                            {order.observation || "Sem observação"}
                        </span>
                        <button
                            onClick={() => console.log("Atualizar Observação")}
                            className="text-blue-500 underline hover:text-blue-700"
                        >
                            Atualizar
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CardOrder;
