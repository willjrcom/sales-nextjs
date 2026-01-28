import { useDroppable } from "@dnd-kit/core";

interface OrderProps {
    id: string;
    children: React.ReactNode;
    activeId: string | null;
    canReceive: (id: string) => boolean; // Função para verificar se pode receber o item
}

function DroppableFinish({ id, children, activeId, canReceive }: OrderProps) {
    const { isOver, setNodeRef } = useDroppable({ id });

    // Define a cor do contêiner com base na lógica de receber o item
    const backgroundColor = isOver
        ? canReceive(activeId || "") // Se o item pode ser solto aqui
            ? "#d1fadf" // Verde
            : "#fad1d1" // Vermelho
        : "#ffffff"; // Branco padrão

    const style = {
        padding: "16px",
        borderRadius: "8px",
        border: "2px dashed #d1d5db",
        backgroundColor,
        boxShadow: isOver ? "0 4px 10px rgba(0, 128, 0, 0.2)" : "none",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        width: "15vw",
        height: "58vh",
        display: "flex",
        alignItems: "center", // Centraliza os cards na coluna
        justifyContent: "flex-start", // Alinha os cards no topo
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center">
            {children}
            <div className="mt-4 flex flex-col w-full">
                <p>Arraste aqui para finalizar o pedido</p>
            </div>
        </div>

    );
}

export default DroppableFinish;
