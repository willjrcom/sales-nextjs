import { DndContext } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import Order from '@/app/entities/order/order';
import Droppable from './droppable';
import { useOrders } from '@/app/context/order/context';

function App() {
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [finishedOrders, setFinishedOrders] = useState<Order[]>([]);
    const contextOrder = useOrders();
    
    useEffect(() => {
        const pendings = contextOrder.items.filter(order => order.status === "Pending");
        const ready = contextOrder.items.filter(order => order.status === "Ready");
        const finished = contextOrder.items.filter(order => order.status === "Finished");
        setPendingOrders(pendings);
        setReadyOrders(ready);
        setFinishedOrders(finished);
    }, [contextOrder.items]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        console.log(active, over);
        if (!over) return;

        // Verificar se o item foi arrastado de 'pending' para 'Ready'
        if (over.id === 'Ready' && active.id.startsWith('Pending-')) {
            const draggedOrderId = active.data.current.id;
            const draggedOrder = pendingOrders.find(order => order.id === draggedOrderId);
            
            console.log(draggedOrderId)
            if (draggedOrder) {
                draggedOrder.status = "Ready";
                setPendingOrders(prev => prev.filter(order => order.id !== draggedOrder.id));
                setReadyOrders(prev => [...prev, draggedOrder]);
            }
        }

        // Verificar se o item foi arrastado de 'ready' para 'Finished'
        if (over.id === 'Finished' && active.id.startsWith('Ready-')) {
            const draggedOrderId = active.data.current.id;
            const draggedOrder = readyOrders.find(order => order.id === draggedOrderId);
            
            if (draggedOrder) {
                draggedOrder.status = "Finished";
                setReadyOrders(prev => prev.filter(order => order.id !== draggedOrder.id));
                setFinishedOrders(prev => [...prev, draggedOrder]);
            }
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-6 p-6">
                {/* Pendentes */}
                <Droppable id="Pending" orders={pendingOrders}>
                    <h2 className="text-2xl font-bold text-gray-800">Pendentes</h2>
                </Droppable>

                {/* Em andamento */}
                <Droppable id="Ready" orders={readyOrders}>
                    <h2 className="text-2xl font-bold text-gray-800">Prontos</h2>
                </Droppable>

                {/* Finalizados */}
                <Droppable id="Finished" orders={finishedOrders}>
                    <h2 className="text-2xl font-bold text-gray-800">Finalizados</h2>
                </Droppable>
            </div>
        </DndContext>
    );
}



export default App;
