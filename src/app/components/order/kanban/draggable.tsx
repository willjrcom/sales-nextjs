import { useDraggable } from "@dnd-kit/core";
import Order from "@/app/entities/order/order";

interface DraggableProps {
    order: Order;
    children: React.ReactNode;
}

function Draggable({ order, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${order.status}-${order.id}`, // Garantir que o id é único
        data: order,
    });

    const style = {
        ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        backgroundColor: isDragging ? '#f0f8ff' : '', // Cor de fundo enquanto arrasta
        border: isDragging ? '2px solid #007bff' : '', // Borda enquanto arrasta
    };

    return (
        <button
            ref={setNodeRef}
            className={`w-full cursor-move transition-colors duration-200 rounded mb-2`}
            style={style}
            {...listeners}
            {...attributes}
        >
            {children}
        </button>
    );
}

export default Draggable;
