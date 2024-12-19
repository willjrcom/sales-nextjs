import { useEffect, useState } from "react"
import { useCurrentOrder } from "@/app/context/current-order/context"
import Order from "@/app/entities/order/order"
import { useSession } from "next-auth/react"
import PendingOrder from "@/app/api/order/status/pending/route"
import RequestError from "@/app/api/error"
import StatusComponent from "../../button/show-status"
import DeliveryCard from "../type/delivery-order"
import PickupCard from "../type/pickup-order"
import TableCard from "../type/table-order"

export const CardOrderResume = () => {
    const contextCurrentOrder = useCurrentOrder();
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    return (
        <div className="w-80 bg-gray-50 p-3 overflow-y-auto">
            {/* Lançar Pedido */}

            <OrderPaymentsResume />
            {order?.delivery && <DeliveryCard />}
            {order?.pickup && <PickupCard />}
            {order?.table && <TableCard />}
        </div>
    );
};

export const OrderPaymentsResume = () => {
    const { data } = useSession();
    const contextCurrentOrder = useCurrentOrder();
    const [error, setError] = useState<RequestError | null>(null)
    const [order, setOrder] = useState<Order | null>(contextCurrentOrder.order);

    useEffect(() => {
        setOrder(contextCurrentOrder.order)
    }, [contextCurrentOrder.order])

    const onSubmit = async () => {
        if (!order || !data) return

        try {
            await PendingOrder(order.id, data)
            setError(null)
            contextCurrentOrder.fetchData(order.id);
        } catch (error) {
            setError(error as RequestError)
        }
    }

    const isStatusStagingOrPendingOrReady = order?.status == "Staging" || order?.status == "Pending" || order?.status == "Ready"
    const haveGroups = order && order?.groups?.length > 0
    const isAnyGroupsStaging = haveGroups && order?.groups?.some((group) => group.status == "Staging")
    const isThrowButton = isStatusStagingOrPendingOrReady && isAnyGroupsStaging
    const subTotal = (order?.total_payable || 0) - (order?.delivery?.delivery_tax || 0)

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Comanda N° {order?.order_number}</h3>
            {order?.status && <p><StatusComponent status={order?.status} /></p>}
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <br />
            {/* Total do pedido */}
            <p><strong>Subtotal:</strong> R$ {subTotal.toFixed(2)}</p>
            {order?.delivery?.delivery_tax && <p><strong>Taxa de entrega:</strong> R$ {order.delivery.delivery_tax.toFixed(2)}</p>}

            {/* <p>Desconto: R$ 5,00</p> */}
            <hr className="my-2" />
            <p><strong>Total:</strong> R$ {(order?.total_payable || 0).toFixed(2)}</p>
            <br />
            {isThrowButton && <button className="w-full bg-yellow-500 text-white py-2 rounded-lg mb-4" onClick={onSubmit}>
                Lançar Pedido
            </button>}
        </div>
    )
}
