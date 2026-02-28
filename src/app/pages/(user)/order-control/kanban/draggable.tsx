import { useDraggable } from "@dnd-kit/core";
import Order from "@/app/entities/order/order";
import React from 'react';
import { cn } from "@/lib/utils";

interface DraggableProps {
    order: Order;
    children: React.ReactNode;
}

function Draggable({ order, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `${order.status}-${order.id}`,
        data: order,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "w-full transition-all duration-200",
                isDragging && "opacity-0"
            )}
            {...listeners}
            {...attributes}
        >
            {children}
        </div>
    );
}

export default React.memo(Draggable);
