import { useDraggable } from "@dnd-kit/core";
import Order from "@/app/entities/order/order";

interface DraggableProps {
    order: Order;
    children: React.ReactNode;
}

function Draggable({ order, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${order.status}-${order.id}`,
        data: order,
    });

    // Compute transform and z-index when dragging
    const containerStyle = {
        ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        zIndex: isDragging ? 1000 : 'auto',
    } as React.CSSProperties;

    return (
        <div
            ref={setNodeRef}
            style={containerStyle}
            className={
                `mb-4 bg-white rounded-lg p-4 cursor-move transition-all duration-150 ` +
                (isDragging
                    ? 'border-2 border-blue-500 shadow-2xl opacity-90'
                    : 'shadow hover:shadow-lg'
                )
            }
            {...listeners}
            {...attributes}
        >
            {children}
        </div>
    );
}

export default Draggable;
