import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import Order, { StatusOrder } from "@/app/entities/order/order";
import Droppable from "./droppable";
import { useOrders } from "@/app/context/order/context";
import { useModal } from "@/app/context/modal/context";
import OrderManager from "../order/order";
import EditGroupItem from "../order/group-item/edit-group-item";

function App() {
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [finishedOrders, setFinishedOrders] = useState<Order[]>([]);
    const [lastClickTime, setLastClickTime] = useState<number | null>(null);
    const [preventDrag, setPreventDrag] = useState(false); // Flag para evitar o arrasto
    const modalHandler = useModal();
    const contextOrder = useOrders();

    useEffect(() => {
        setPreventDrag(false); // Ativa a flag para prevenir o arrasto
        setLastClickTime(null);
    }, [preventDrag]);

    // Atualiza as listas com base no contexto
    useEffect(() => {
        setPendingOrders(contextOrder.items.filter(order => order.status === "Pending"));
        setReadyOrders(contextOrder.items.filter(order => order.status === "Ready"));
        setFinishedOrders(contextOrder.items.filter(order => order.status === "Finished"));
    }, [contextOrder.items]);

    const handleDragEnd = (event: { active: any; over: any }) => {

        const { active, over } = event;

        if (!over) return; // Não fazer nada se o item não foi solto em um destino válido

        const draggedOrderId = active.data.current?.id;
        if (!draggedOrderId) return;

        const moveOrder = (source: Order[], target: Order[], status: StatusOrder) => {
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
            moveOrder(pendingOrders, readyOrders, "Ready");
        } else if (over.id === "Finished" && active.id.startsWith("Ready-")) {
            moveOrder(readyOrders, finishedOrders, "Finished");
        }
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                // Evita a ativação do arrasto se o preventDrag estiver true
                distance: preventDrag ? Infinity : 5,
            },
            onActivation: () => {
                const now = Date.now();

                // Verifica se o último clique foi dentro de 300ms (double click)
                if (lastClickTime && now - lastClickTime < 300) {
                    setLastClickTime(null); // Reseta o estado após o double click
                    setPreventDrag(true); // Ativa a flag para prevenir o arrasto
                    modalHandler.showModal("edit-group-item", "Novo Pedido", <EditGroupItem/>, "xl", () => modalHandler.hideModal("edit-group-item"));
                } else {
                    setLastClickTime(now); // Atualiza o tempo do último clique
                }
            },
        })
    );

    return (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
            <div className="flex space-x-6 p-6">
                {/* Pendentes */}
                <Droppable id="Pending" orders={pendingOrders}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Pendentes</h2>
                </Droppable>

                {/* Em andamento */}
                <Droppable id="Ready" orders={readyOrders}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Prontos</h2>
                </Droppable>

                {/* Finalizados */}
                <Droppable id="Finished" orders={finishedOrders}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Finalizados</h2>
                </Droppable>
            </div>
        </DndContext>
    );
}

export default App;
