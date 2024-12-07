import { useDraggable } from "@dnd-kit/core";
import { useRef } from "react";
import Order from "@/app/entities/order/order";
import { useModal } from "@/app/context/modal/context";
import EditGroupItem from "../order/group-item/edit-group-item";

interface DraggableProps {
    order: Order;
    children: React.ReactNode;
}

function Draggable({ order, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${order.status}-${order.id}`, // ID único do item
        data: order,
    });

    const mouseDownTimeRef = useRef<number | null>(null);
    const modalHandler = useModal();

    const handleMouseDown = () => {
        mouseDownTimeRef.current = Date.now(); // Registra o tempo do clique
    };

    const handleMouseUp = () => {
        const now = Date.now();
        const mouseDownTime = mouseDownTimeRef.current;

        if (mouseDownTime && now - mouseDownTime < 300) {
            // Clique curto detectado
            modalHandler.showModal("edit-group-item", "Novo Pedido", <EditGroupItem />, "xl", () => modalHandler.hideModal("edit-group-item"));
        }

        mouseDownTimeRef.current = null; // Reseta o tempo do clique
    };

    const style = {
        ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        backgroundColor: isDragging ? "#f0f8ff" : "white",
        border: isDragging ? "2px solid #007bff" : "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "move",
        transition: "background-color 0.2s, border 0.2s",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            {children}
        </div>
    );
}

export default Draggable;
