import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import Order, { StatusOrder } from "@/app/entities/order/order";
import Droppable from "./droppable";
import { useOrders } from "@/app/context/order/context";
import { useModal } from "@/app/context/modal/context";
import CardOrder from "../order/card-order";
import ReadyOrder from "@/app/api/order/status/ready/route";
import { useSession } from "next-auth/react";
import FinishOrder from "@/app/api/order/status/finish/route";
import RequestError from "@/app/api/error";

function OrderKanban() {
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [finishedOrders, setFinishedOrders] = useState<Order[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null); // ID do item sendo arrastado
    const [lastClickTime, setLastClickTime] = useState<number | null>(null);
    const [preventDrag, setPreventDrag] = useState(false); // Flag para evitar o arrasto
    const modalHandler = useModal();
    const contextOrder = useOrders();
    const { data } = useSession();

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

    const handleDragStart = (event: { active: any }) => {
        setActiveId(event.active.id); // Atualiza o ID do item ativo
    };

    const handleDragEnd = async (event: { active: any; over: any }) => {
        setActiveId(null); // Reseta o ID ativo ao final do arrasto

        const { active, over } = event;

        if (!over) return; // Não fazer nada se o item não foi solto em um destino válido

        const draggedOrderId = active.data.current?.id;
        if (!draggedOrderId) return;

        const moveOrder = (source: Order[], status: StatusOrder) => {
            const draggedOrder = source.find(order => order.id === draggedOrderId);
            if (!draggedOrder) return;

            const updatedOrder: Order = { ...draggedOrder, status };
            console.log(status)
            // Atualiza as listas de forma imutável
            setPendingOrders(prev => prev.filter(order => order.id !== draggedOrder.id));
            setReadyOrders(prev => prev.filter(order => order.id !== draggedOrder.id));
            setFinishedOrders(prev => prev.filter(order => order.id !== draggedOrder.id));

            if (over.id === "Pending") setPendingOrders(prev => [...prev, updatedOrder]);
            if (over.id === "Ready") setReadyOrders(prev => [...prev, updatedOrder]);
            if (over.id === "Finished") setFinishedOrders(prev => [...prev, updatedOrder]);
        };

        const indexId = activeId?.indexOf("-");
        const orderId = activeId?.substring(indexId ? indexId + 1 : 0);

        // Decide para qual lista mover com base no ID do droppable
        if (over.id === "Ready" && active.id.startsWith("Pending-")) {
            moveOrder(pendingOrders, "Ready");
            
            if (!orderId || !data) return;
            try {
                await ReadyOrder(orderId, data);
            } catch (error) {}

        } else if (over.id === "Finished" && active.id.startsWith("Ready-")) {
            if (!orderId || !data) return;

            try {
                await FinishOrder(orderId, data);
                moveOrder(readyOrders, "Finished");
            } catch (error) {
                handleDoubleClick(orderId, error as RequestError);
            }
        }
    };

    const isDoubleClick = (now: number) => lastClickTime && now - lastClickTime < 300;

    const handleDoubleClick = (orderId: string, error?: RequestError | null) => {
        const onClose = () => {
            contextOrder.fetchData();
            modalHandler.hideModal("show-order-" + orderId)
        }
        modalHandler.showModal(
            "show-order-" + orderId,
            "Ver Pedido",
            <CardOrder orderId={orderId} errorRequest={error}/>,
            "xl",
            onClose
        );
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: preventDrag ? Infinity : 5,
            },
            onActivation: () => {
                const now = Date.now();
                if (isDoubleClick(now)) {
                    setLastClickTime(null);
                    setPreventDrag(true);
                    const indexId = activeId?.indexOf("-");
                    const orderId = activeId?.substring(indexId ? indexId + 1 : 0);
                    if (!orderId) return;
                    handleDoubleClick(orderId);
                } else {
                    setLastClickTime(now);
                }
            },
        })
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragPending={(event) => setActiveId(event.id as string)}>
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

export default OrderKanban;
