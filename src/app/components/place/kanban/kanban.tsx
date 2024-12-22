import { DndContext, MouseSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";

import { useModal } from "@/app/context/modal/context";
import ReadyOrder from "@/app/api/order/status/ready/route";
import { useSession } from "next-auth/react";
import FinishOrder from "@/app/api/order/status/finish/route";
import RequestError from "@/app/api/error";
import { EntityState } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Table from "@/app/entities/table/table";
import Droppable from "./dropable";
import Place from "@/app/entities/place/place";
import { fetchPlaces } from "@/redux/slices/places";

interface PlaceKanbanProps {
    slice: EntityState<Place, string>;
}

function PlaceKanban({ slice }: PlaceKanbanProps) {
    const [addedTables, setAddedTables] = useState<Table[]>([]);
    const [unaddedTables, setUnaddedTables] = useState<Table[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null); // ID do item sendo arrastado
    const [lastClickTime, setLastClickTime] = useState<number | null>(null);
    const [preventDrag, setPreventDrag] = useState(false); // Flag para evitar o arrasto
    const modalHandler = useModal();
    const dispatch = useDispatch<AppDispatch>();

    const { data } = useSession();

    useEffect(() => {
        if (data && Object.keys(slice.entities).length === 0) {
            dispatch(fetchPlaces(data));
        }

        const interval = setInterval(() => {
            if (data) {
                dispatch(fetchPlaces(data));
            }
        }, 30000); // Atualiza a cada 30 segundos

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    }, [data?.user.idToken, dispatch]);

    useEffect(() => {
        setPreventDrag(false); // Ativa a flag para prevenir o arrasto
        setLastClickTime(null);
    }, [preventDrag]);

    // Atualiza as listas com base no contexto
    useEffect(() => {
        setAddedTables(Object.values(slice.entities));
        setUnaddedTables(Object.values(slice.entities));
    }, [slice.entities]);

    const handleDragStart = (event: { active: any }) => {
        setActiveId(event.active.id); // Atualiza o ID do item ativo
    };

    const handleDragEnd = async (event: { active: any; over: any }) => {
        setActiveId(null); // Reseta o ID ativo ao final do arrasto

        const { active, over } = event;

        if (!over) return; // Não fazer nada se o item não foi solto em um destino válido

        const draggedOrderId = active.data.current?.id;
        if (!draggedOrderId) return;

        const moveOrder = (source: Table[]) => {
            const draggedOrder = source.find(order => order.id === draggedOrderId);
            if (!draggedOrder) return;

            const updatedOrder: Table = { ...draggedOrder };

            // Atualiza as listas de forma imutável
            setAddedTables(prev => prev.filter(order => order.id !== draggedOrder.id));
            setUnaddedTables(prev => prev.filter(order => order.id !== draggedOrder.id));

            if (over.id === "Pending") setAddedTables(prev => [...prev, updatedOrder]);
            if (over.id === "Ready") setUnaddedTables(prev => [...prev, updatedOrder]);
        };

        const indexId = activeId?.indexOf("-");
        const orderId = activeId?.substring(indexId ? indexId + 1 : 0);

        // Decide para qual lista mover com base no ID do droppable
        if (over.id === "Ready" && active.id.startsWith("Pending-")) {
            moveOrder(addedTables);

            if (!orderId || !data) return;
            try {
                await ReadyOrder(orderId, data);
                dispatch(fetchPlaces(data));
            } catch (error) { }

        } else if (over.id === "Finished" && active.id.startsWith("Ready-")) {
            if (!orderId || !data) return;

            try {
                await FinishOrder(orderId, data);
                moveOrder(unaddedTables, );
                dispatch(fetchPlaces(data));
            } catch (error) {
                handleDoubleClick(orderId, error as RequestError);
            }
        }
    };

    const isDoubleClick = (now: number) => lastClickTime && now - lastClickTime < 300;

    const handleDoubleClick = (orderId: string, error?: RequestError | null) => {
        const onClose = () => {
            modalHandler.hideModal("show-order-" + orderId)
        }
        modalHandler.showModal(
            "show-order-" + orderId,
            "Ver Pedido",
            <h1>mesa</h1>,
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
                    tables={addedTables}
                    activeId={activeId}
                    canReceive={() => activeId?.startsWith("Pending-") || false}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Pendentes</h2>
                </Droppable>

                {/* Em andamento */}
                <Droppable
                    id="Ready"
                    tables={unaddedTables}
                    activeId={activeId}
                    canReceive={() => activeId?.startsWith("Pending-") || activeId?.startsWith("Ready-") || false}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Prontos</h2>
                </Droppable>
            </div>
        </DndContext>
    );
}

export default PlaceKanban;
