import Order from "@/app/entities/order/order";
import { useDroppable } from "@dnd-kit/core";
import Draggable from "./draggable";
import { FaLuggageCart, FaPaperPlane, FaUtensils } from "react-icons/fa";

interface OrderProps {
    id: string;
    orders: Order[];
    children: React.ReactNode;
    activeId: string | null;
    canReceive: (id: string) => boolean; // Função para verificar se pode receber o item
}

function Droppable({ id, orders, children, activeId, canReceive }: OrderProps) {
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
        width: "25vw",
        height: "58vh",
        display: "flex",
        alignItems: "center", // Centraliza os cards na coluna
        justifyContent: "flex-start", // Alinha os cards no topo
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center">
            {children}
            <div className="mt-4 flex flex-col w-full">
                {orders.map(order => (
                    <Draggable key={order.id} order={order}>
                        <div className="flex items-center justify-between h-[5vh] border-black">
                            {/* Texto "Pedido X" */}
                            <div className="ml-4 text-lg font-bold">Pedido {order.order_number}</div>

                            {/* Elemento Verde à Direita */}
                            {order.delivery && (
                                <div className="h-full w-[5vw] bg-blue-400 rounded text-white flex items-center justify-center">
                                    <FaPaperPlane className="w-6 h-6" />
                                </div>
                            )}
                            {order.table && (
                                <div className="h-full w-[5vw] bg-blue-400 rounded text-white flex items-center justify-center">
                                    <FaUtensils className="w-6 h-6" />
                                </div>
                            )}
                            {order.pickup && (
                                <div className="h-full w-[5vw] bg-blue-400 rounded text-white flex items-center justify-center">
                                    <FaLuggageCart className="w-6 h-6"/>
                                </div>
                            )}
                        </div>
                    </Draggable>
                ))}
            </div>
        </div>

    );
}

export default Droppable;
