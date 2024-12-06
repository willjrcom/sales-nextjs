import Order from "@/app/entities/order/order";
import { useDroppable } from "@dnd-kit/core";
import Draggable from './draggable';

interface OrderProps {
    id: string;
    orders: Order[];
    children: React.ReactNode;
}

function Droppable({ id, orders, children }: OrderProps) {
    const { isOver, setNodeRef } = useDroppable({
        id
    });

    const style = {
        padding: '16px',
        borderRadius: '8px',
        border: '2px dashed #d1d5db',
        minHeight: '400px',
        backgroundColor: isOver ? '#f0fdf4' : '#ffffff',
        boxShadow: isOver ? '0 4px 10px rgba(0, 128, 0, 0.2)' : 'none',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        width: '33vw',
        display: 'flex',
        alignItems: 'center', // Centraliza os cards na coluna
        justifyContent: 'flex-start' // Alinha os cards no topo, mas você pode mudar para 'center' se quiser centralizar também verticalmente
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center">
            {children}
            <div className="mt-4 flex flex-col w-full">
                {orders.map((order) => (
                    <Draggable key={order.id} order={order}>
                        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                            Pedido {order.order_number}
                        </div>
                    </Draggable>
                ))}
            </div>
        </div>
    );
}

export default Droppable