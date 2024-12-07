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

    // Estilo do item
    const style = {
        ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        backgroundColor: isDragging ? '#f0f8ff' : 'white', // Cor de fundo enquanto arrasta
        border: isDragging ? '2px solid #007bff' : '1px solid #ccc', // Borda enquanto arrasta
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'move',
        transition: 'background-color 0.2s, border 0.2s',
        justifyContent: 'center' as const,
        textAlign: 'center' as const, // Corrigido para tipo literal 'center'
    };


    return (
        <button
            ref={setNodeRef}
            className="w-full"
            style={style}
            {...listeners}
            {...attributes}
        >
            {children}
        </button>
    );
}

export default Draggable;
