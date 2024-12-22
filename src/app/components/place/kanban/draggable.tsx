import Table from "@/app/entities/table/table";
import { useDraggable } from "@dnd-kit/core";

interface DraggableProps {
    table: Table;
    children: React.ReactNode;
}

function Draggable({ table, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${table.id}`, // Garantir que o id é único
        data: table,
    });

    const style = {
        ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        backgroundColor: isDragging ? '#f0f8ff' : '', // Cor de fundo enquanto arrasta
        border: isDragging ? '2px solid #007bff' : '', // Borda enquanto arrasta
    };

    return (
        <button
            ref={setNodeRef}
            className={`w-full rounded font-bold text-[16px] cursor-move transition-colors duration-200 text-center border mb-2`}
            style={style}
            {...listeners}
            {...attributes}
        >
            {children}
        </button>
    );
}

export default Draggable;
