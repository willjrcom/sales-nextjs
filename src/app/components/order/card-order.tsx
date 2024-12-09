import Order from "@/app/entities/order/order";
import StatusComponent from "../button/show-status";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import GetOrderByID from "@/app/api/order/[id]/route";
import RequestError from "@/app/api/error";
import RoundComponent from "../button/round-component";

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

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            {/* Informações Básicas */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">Informações do Pedido</h3>
                <p className="text-gray-700">
                    <strong>Comanda N°:</strong> {order.order_number}
                </p>
                <p className="text-gray-700 flex items-center">
                    <strong>Status:</strong>
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
                        <span className="font-semibold">Itens:</span> {order.quantity_items}
                    </p>
                    {order.observation && (
                        <p className="italic">
                            <span className="font-semibold">Observação:</span> {order.observation}
                        </p>
                    )}
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
                </div>
            </div>
        </div>
    );
};

export default CardOrder;
