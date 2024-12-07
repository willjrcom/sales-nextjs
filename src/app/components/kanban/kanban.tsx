import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import Order, { StatusOrder } from "@/app/entities/order/order";
import Droppable from "./droppable";
import { useOrders } from "@/app/context/order/context";

function App() {
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [finishedOrders, setFinishedOrders] = useState<Order[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null); // ID do item sendo arrastado

    const contextOrder = useOrders();

    // Atualiza as listas com base no contexto
    useEffect(() => {
        setPendingOrders(contextOrder.items.filter(order => order.status === "Pending"));
        setReadyOrders(contextOrder.items.filter(order => order.status === "Ready"));
        setFinishedOrders(contextOrder.items.filter(order => order.status === "Finished"));
    }, [contextOrder.items]);

    const handleDragStart = (event: { active: any }) => {
        setActiveId(event.active.id); // Atualiza o ID do item ativo
    };

    const handleDragEnd = (event: { active: any; over: any }) => {
        setActiveId(null); // Reseta o ID ativo ao final do arrasto

        const { active, over } = event;

        if (!over) return; // Não fazer nada se o item não foi solto em um destino válido

        const draggedOrderId = active.data.current?.id;
        if (!draggedOrderId) return;

        const moveOrder = (source: Order[], status: StatusOrder) => {
            const draggedOrder = source.find(order => order.id === draggedOrderId);
            if (!draggedOrder) return;

            const updatedOrder: Order = { ...draggedOrder, status };

            // Atualiza as listas de forma imutável
            setPendingOrders(prev => prev.filter(order => order.id !== draggedOrder.id));
            setReadyOrders(prev => prev.filter(order => order.id !== draggedOrder.id));
            setFinishedOrders(prev => prev.filter(order => order.id !== draggedOrder.id));

            if (over.id === "Pending") setPendingOrders(prev => [...prev, updatedOrder]);
            if (over.id === "Ready") setReadyOrders(prev => [...prev, updatedOrder]);
            if (over.id === "Finished") setFinishedOrders(prev => [...prev, updatedOrder]);
        };

        // Decide para qual lista mover com base no ID do droppable
        if (over.id === "Ready" && active.id.startsWith("Pending-")) {
            moveOrder(pendingOrders, "Ready");
        } else if (over.id === "Finished" && active.id.startsWith("Ready-")) {
            moveOrder(readyOrders, "Finished");
        }
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex space-x-6 p-6">
                {/* Pendentes */}
                <Droppable
                    id="Pending"
                    orders={pendingOrders}
                    activeId={activeId}
                    canReceive={() => activeId?.startsWith("Pending-") || false}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Pendentes</h2>
                </Droppable>

                {/* Em andamento */}
                <Droppable
                    id="Ready"
                    orders={readyOrders}
                    activeId={activeId}
                    canReceive={() => activeId?.startsWith("Pending-") || activeId?.startsWith("Ready-") || false}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Prontos</h2>
                </Droppable>

                {/* Finalizados */}
                <Droppable
                    id="Finished"
                    orders={finishedOrders}
                    activeId={activeId}
                    canReceive={() => activeId?.startsWith("Ready-") || activeId?.startsWith("Finished-") || false}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Finalizados</h2>
                </Droppable>
            </div>
        </DndContext>
    );
}

export default App;
