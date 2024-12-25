import Order from "@/app/entities/order/order";
import OrderItemList from "./order-item-list";

type OrderListProps = {
    orders: Order[];
};

const CardOrderListItem = ({ orders }: OrderListProps) => {
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-4">
                <p>Sem pedidos disponíveis.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4">
            {orders.map((order) => (
                <OrderItemList key={order.id} order={order} />
            ))}
        </div>
    );
};

export default CardOrderListItem;
