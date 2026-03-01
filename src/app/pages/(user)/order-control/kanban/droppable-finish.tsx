import { useDroppable } from "@dnd-kit/core";
import { CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderProps {
    id: string;
    children: React.ReactNode;
    activeId: string | null;
    canReceive: (id: string) => boolean;
}

function DroppableFinish({ id, children, activeId, canReceive }: OrderProps) {
    const { isOver, setNodeRef } = useDroppable({ id });
    const isReceivable = canReceive(activeId || "");

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-1 min-w-[100px] h-[calc(100vh-140px)] flex flex-col bg-gray-100/40 rounded-[2rem] border-2 border-transparent transition-all duration-300 p-4 relative overflow-hidden",
                isOver && isReceivable && "bg-blue-50 border-blue-200 shadow-inner",
                isOver && !isReceivable && "bg-red-50 border-red-200 shadow-inner"
            )}
        >
            <div className="mb-4 px-2">
                {children}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className={cn(
                    "w-20 h-20 rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center transition-all duration-500",
                    isOver && isReceivable ? "bg-blue-100 border-blue-400 scale-110 rotate-12" : "bg-white"
                )}>
                    {isOver && isReceivable ? (
                        <CheckCircle2 className="w-10 h-10 text-blue-600 animate-bounce" />
                    ) : (
                        <CheckCircle2 className="w-10 h-10 text-gray-200" />
                    )}
                </div>

                <div className="mt-6 space-y-2">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-tight">
                        {isOver && isReceivable ? "Solte para Finalizar" : "Finalizar Pedido"}
                    </p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                        Arraste aqui para concluir
                    </p>
                </div>
            </div>

            {/* Subtle background icon */}
            <CheckCircle2 className="absolute -bottom-8 -right-8 w-32 h-32 text-gray-200/20 -rotate-12 pointer-events-none" />
        </div>
    );
}

export default DroppableFinish;
