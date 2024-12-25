import Order from "@/app/entities/order/order";
import { FaLuggageCart, FaMotorcycle, FaUtensils } from "react-icons/fa";
import CardOrder from "../card-order";
import { useModal } from "@/app/context/modal/context";
import RequestError from "@/app/api/error";

interface OrderItemListProps {
    order: Order;
    error?: RequestError | null;
}

const OrderItemList = ({ order, error }: OrderItemListProps) => {
    const modalHandler = useModal();

    const OpenOrder = () => {
        const onClose = () => {
            modalHandler.hideModal("show-order-" + order.id)
        }
        modalHandler.showModal(
            "show-order-" + order.id,
            "Ver Pedido",
            <CardOrder orderId={order.id} errorRequest={error} />,
            "xl",
            onClose
        );
    };
    
    return (
        <div className="flex items-center justify-between h-[5vh] border-black border rounded" onClick={OpenOrder}>
            {/* Texto "Pedido X" */}
            <div className="ml-4 text-lg font-bold">Pedido {order.order_number}</div>

            {/* Elemento Verde à Direita */}
            {order.delivery && (
                <div className="h-full w-[5vw] bg-blue-400 rounded text-white flex items-center justify-center">
                    <FaMotorcycle className="w-6 h-6" />
                </div>
            )}
            {order.table && (
                <div className="h-full w-[5vw] bg-blue-400 rounded text-white flex items-center justify-center">
                    <FaUtensils className="w-6 h-6" />
                </div>
            )}
            {order.pickup && (
                <div className="h-full w-[5vw] bg-blue-400 rounded text-white flex items-center justify-center">
                    <FaLuggageCart className="w-6 h-6" />
                </div>
            )}
        </div>
    )
}

export default OrderItemList