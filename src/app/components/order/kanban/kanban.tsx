import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState, useMemo } from "react";
import Order, { StatusOrder } from "@/app/entities/order/order";
import Droppable from "./droppable";
import { useModal } from "@/app/context/modal/context";
import CardOrder from "../card-order";
import ReadyOrder from "@/app/api/order/status/ready/order";
import { useSession } from "next-auth/react";
import FinishOrder from "@/app/api/order/status/finish/order";
import RequestError from "@/app/utils/error";
import { EntityState } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { fetchOrders } from "@/redux/slices/orders";
import DroppableFinish from "./droppable-finish";

interface OrderKanbanProps {
    slice: EntityState<Order, string>;
}

function OrderKanban({ slice }: OrderKanbanProps) {
    // Derive lists via useMemo to avoid extra state and reduce renders
    const allOrders = useMemo(() => Object.values(slice.entities), [slice.entities]);
    const pendingOrders = useMemo(
        () => allOrders.filter(order => order.status === "Pending"),
        [allOrders]
    );
    const readyOrders = useMemo(
        () => allOrders.filter(order => order.status === "Ready"),
        [allOrders]
    );
    const [activeId, setActiveId] = useState<string | null>(null); // ID do item sendo arrastado
    const [preventDrag, setPreventDrag] = useState(false); // Flag para evitar o arrasto
    const modalHandler = useModal();
    const dispatch = useDispatch<AppDispatch>();

    const { data } = useSession();

    useEffect(() => {
        setPreventDrag(false); // Ativa a flag para prevenir o arrasto
    }, [preventDrag]);


    const handleDragStart = (event: { active: any }) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: { active: any; over: any }) => {
        setActiveId(null); // Reseta o ID ativo ao final do arrasto

        const { active, over } = event;

        if (!over) return; // Não fazer nada se o item não foi solto em um destino válido

        const draggedOrderId = active.data.current?.id;
        if (!draggedOrderId) return;


        const indexId = activeId?.indexOf("-");
        const orderId = activeId?.substring(indexId ? indexId + 1 : 0);

        // Decide para qual lista mover com base no ID do droppable
        if (over.id === "Ready" && active.id.startsWith("Pending-")) {
            if (!orderId || !data) return;
            try {
                await ReadyOrder(orderId, data);
                dispatch(fetchOrders({ session: data }));
            } catch (error) { }

        } else if (over.id === "Finished" && active.id.startsWith("Ready-")) {
            if (!orderId || !data) return;
            try {
                await FinishOrder(orderId, data);
                dispatch(fetchOrders({ session: data }));
            } catch (error) {
                OpenOrder(orderId, error as RequestError);
            }
        }
    };
    const OpenOrder = (orderId: string, error: RequestError) => {
        const onClose = () => {
            modalHandler.hideModal("show-order-" + orderId)
        }
        modalHandler.showModal(
            "show-order-" + orderId,
            "Ver Pedido",
            <CardOrder orderId={orderId} />,
            "xl",
            onClose
        );
    };

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: preventDrag ? Infinity : 5,
            },
        })
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragPending={(event) => setActiveId(event.id as string)}>
            <div className="flex space-x-6 p-6 flex-nowrap">
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
                <DroppableFinish
                    id="Finished"
                    activeId={activeId}
                    canReceive={() => activeId?.startsWith("Ready-") || activeId?.startsWith("Finished-") || false}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Finalizados</h2>
                </DroppableFinish>
            </div>
        </DndContext>
    );
}

export default OrderKanban;
