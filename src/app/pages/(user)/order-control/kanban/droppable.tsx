import Order from "@/app/entities/order/order";
import { useDroppable } from "@dnd-kit/core";
import Draggable from "./draggable";
import OrderItemList from "./order-item-list";
import { cn } from "@/lib/utils";

interface OrderProps {
    id: string;
    orders: Order[];
    children: React.ReactNode;
    activeId: string | null;
    canReceive: (id: string) => boolean;
}

function Droppable({ id, orders, children, activeId, canReceive }: OrderProps) {
    const { isOver, setNodeRef } = useDroppable({ id });
    const isReceivable = canReceive(activeId || "");

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-1 min-w-[300px] h-[calc(100vh-140px)] flex flex-col bg-gray-100/40 rounded-[2rem] border-2 border-transparent transition-all duration-300 p-4",
                isOver && isReceivable && "bg-emerald-50 border-emerald-200 shadow-inner",
                isOver && !isReceivable && "bg-red-50 border-red-200 shadow-inner"
            )}
        >
            <div className="mb-4 px-2">
                {children}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {orders?.map(order => (
                    <Draggable key={order.id} order={order}>
                        <OrderItemList order={order} />
                    </Draggable>
                ))}

                {orders?.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-16 h-16 border-4 border-dashed border-gray-400 rounded-3xl mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest text-gray-500">Vazio</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Droppable;
