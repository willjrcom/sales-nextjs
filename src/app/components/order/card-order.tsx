import Order from "@/app/entities/order/order"
import StatusComponent from "../button/show-status"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import GetOrderByID from "@/app/api/order/[id]/route"
import RequestError from "@/app/api/error"

interface CardOrderProps {
    orderId: string | null
}

const CardOrder = ({ orderId }: CardOrderProps) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<RequestError | null>(null);
    const { data } = useSession();

    const fetchOrder = async () => {
        if (!data || !orderId) return

        try {
            const orderFound = await GetOrderByID(orderId, data);
            setOrder(orderFound);
            setError(null);
        } catch (error) {
            setError(error as RequestError);
            setOrder(null);
        }
    }

    useEffect(() => {
        fetchOrder();
    }, [orderId])

    if (error) return <p className="mb-4 text-red-500">{error.message}</p>
    if (!order) return null
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <p>Comanda N° {order.order_number}</p>
            {order?.status && <p><StatusComponent status={order?.status} /></p>}
        </div>
    )
}

export default CardOrder