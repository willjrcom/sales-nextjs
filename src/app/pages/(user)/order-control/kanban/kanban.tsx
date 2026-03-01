import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from "@dnd-kit/core";
import { useState, useMemo } from "react";
import Order from "@/app/entities/order/order";
import Droppable from "./droppable";
import DroppableFinish from "./droppable-finish";
import ReadyOrder from "@/app/api/order/status/ready/order";
import FinishOrder from "@/app/api/order/status/finish/order";
import { useSession } from "next-auth/react";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { useQueryClient } from "@tanstack/react-query";
import OrderItemList from "./order-item-list";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderKanbanProps {
    orders: Order[];
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

function OrderKanban({ orders }: OrderKanbanProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const pendingOrders = useMemo(
        () => orders.filter(o => o.status === "Pending").sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        [orders]
    );
    const readyOrders = useMemo(
        () => orders.filter(o => o.status === "Ready").sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        [orders]
    );

    const handleDragStart = (event: any) => {
        setActiveOrder(event.active.data.current);
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveOrder(null);

        if (!over || isProcessing || !session) return;

        const order = active.data.current as Order;
        const targetStatus = over.id;

        if (order.status === targetStatus) return;

        try {
            setIsProcessing(true);
            if (targetStatus === "Ready" && order.status === "Pending") {
                await ReadyOrder(order.id, session);
                notifySuccess(`Pedido ${order.order_number} pronto!`);
            } else if (targetStatus === "Finished" && order.status === "Ready") {
                await FinishOrder(order.id, session);
                notifySuccess(`Pedido ${order.order_number} finalizado!`);
            }
            queryClient.invalidateQueries({ queryKey: ['opened-orders'] });
        } catch (error: any) {
            notifyError(error.message || "Erro ao atualizar pedido");
        } finally {
            setIsProcessing(false);
        }
    };

    const canReceivePending = (id: string | null) => false; // Por enquanto não volta de Ready para Pending
    const canReceiveReady = (id: string | null) => id?.startsWith("Pending-") || false;
    const canReceiveFinished = (id: string | null) => id?.startsWith("Ready-") || false;

    const ColumnHeader = ({ icon: Icon, title, count, color }: { icon: any, title: string, count?: number, color: string }) => (
        <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-xl flex items-center justify-center", color)}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xs font-black text-gray-700 uppercase tracking-widest leading-none">{title}</h2>
            </div>
            {count !== undefined && (
                <span className="bg-white/50 border border-gray-100 text-gray-500 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                    {count}
                </span>
            )}
        </div>
    );

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-full min-w-max pb-4">
                <Droppable
                    id="Pending"
                    orders={pendingOrders}
                    activeId={activeOrder ? `${activeOrder.status}-${activeOrder.id}` : null}
                    canReceive={() => false}
                >
                    <ColumnHeader
                        icon={Clock}
                        title="Pendentes"
                        count={pendingOrders.length}
                        color="bg-amber-400"
                    />
                </Droppable>

                <Droppable
                    id="Ready"
                    orders={readyOrders}
                    activeId={activeOrder ? `${activeOrder.status}-${activeOrder.id}` : null}
                    canReceive={(id) => canReceiveReady(id)}
                >
                    <ColumnHeader
                        icon={PlayCircle}
                        title="Prontos"
                        count={readyOrders.length}
                        color="bg-blue-500"
                    />
                </Droppable>

                <DroppableFinish
                    id="Finished"
                    activeId={activeOrder ? `${activeOrder.status}-${activeOrder.id}` : null}
                    canReceive={(id) => canReceiveFinished(id)}
                >
                    <ColumnHeader
                        icon={CheckCircle2}
                        title="Finalizar"
                        color="bg-emerald-500"
                    />
                </DroppableFinish>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeOrder ? (
                    <div className="w-[300px] rotate-2 scale-105 shadow-2xl rounded-2xl overflow-hidden pointer-events-none ring-2 ring-blue-500/20 transition-transform">
                        <OrderItemList order={activeOrder} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default OrderKanban;
