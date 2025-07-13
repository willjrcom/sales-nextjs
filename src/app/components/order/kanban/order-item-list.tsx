import Order from "@/app/entities/order/order";
import { FaLuggageCart, FaMotorcycle, FaUtensils } from "react-icons/fa";
import CardOrder from "../card-order";
import { useModal } from "@/app/context/modal/context";

interface OrderItemListProps {
    order: Order;
}

const OrderItemList = ({ order }: OrderItemListProps) => {
    const modalHandler = useModal();

    const OpenOrder = () => {
        const onClose = () => {
            modalHandler.hideModal("show-order-" + order.id)
            modalHandler.hideModal("show-staging-orders")
        }
        modalHandler.showModal(
            "show-order-" + order.id,
            "Ver Pedido",
            <CardOrder orderId={order.id} />,
            "xl",
            onClose
        );
    };
    
    return (
        <div
            className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            onClick={OpenOrder}
        >
            {/* Texto "Pedido X" */}
            <div className="text-lg font-semibold">Pedido {order.order_number}</div>

            {/* Ícones à direita */}
            <div className="flex items-center space-x-2">
                {order.delivery && (
                    <div className="p-2 bg-blue-500 rounded-full text-white">
                        <FaMotorcycle className="w-5 h-5" />
                    </div>
                )}
                {order.table && (
                    <div className="p-2 bg-green-500 rounded-full text-white">
                        <FaUtensils className="w-5 h-5" />
                    </div>
                )}
                {order.pickup && (
                    <div className="p-2 bg-yellow-500 rounded-full text-white">
                        <FaLuggageCart className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderItemList