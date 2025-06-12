import { useDraggable } from "@dnd-kit/core";
import Order from "@/app/entities/order/order";
import React, { useState, useEffect, useRef } from 'react';

interface DraggableProps {
    order: Order;
    children: React.ReactNode;
}

function Draggable({ order, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${order.status}-${order.id}`,
        data: order,
    });
    const ref = useRef<HTMLDivElement | null>(null);

    // Compute transform and z-index when dragging
    // Track initial position to enable fixed positioning during drag
    const [initialRect, setInitialRect] = useState<DOMRect | null>(null);
    // On drag start, record the bounding rect
    useEffect(() => {
        if (isDragging && ref.current) {
            setInitialRect(ref.current.getBoundingClientRect());
        }
    }, [isDragging]);
    // Reset after drag ends
    useEffect(() => {
        if (!isDragging) setInitialRect(null);
    }, [isDragging]);

    let containerStyle: React.CSSProperties;
    if (isDragging && initialRect) {
        // Position the dragged element fixed at its original location plus transform
        const x = transform?.x ?? 0;
        const y = transform?.y ?? 0;
        containerStyle = {
            position: 'fixed',
            left: initialRect.left + x,
            top: initialRect.top + y,
            width: initialRect.width,
            zIndex: 9999,
            pointerEvents: 'none',
        };
    } else {
        containerStyle = {
            position: 'relative',
            zIndex: 'auto',
            ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        };
    }

    return (
        <div
            ref={el => { setNodeRef(el); ref.current = el; }}
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

export default React.memo(Draggable);
