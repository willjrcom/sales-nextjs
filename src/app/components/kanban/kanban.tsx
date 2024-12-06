import { useDroppable, useDraggable, DndContext } from '@dnd-kit/core';
import { useState } from 'react';
import Order from '@/app/entities/order/order';

function App() {
    const [orders, setOrders] = useState<{
        pending: Order[];
        inProgress: Order[];
        finished: Order[];
    }>({
        pending: [
            new Order("1", 1, "Pending", [], [], 10, 10, 10, 5, "", "123"),
            new Order("2", 2, "Pending", [], [], 20, 20, 20, 5, "", "124")
        ],
        inProgress: [],
        finished: []
    });

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        // Verificar se o item foi arrastado de 'pending' para 'InProgress'
        if (over.id === 'InProgress' && active.id.startsWith('Pending-')) {
            const draggedOrderId = active.id.split('-')[1];
            const draggedOrder = orders.pending.find(order => order.id === draggedOrderId);

            if (draggedOrder) {
                draggedOrder.status = "InProgress";
                setOrders(prevOrders => {
                    const updatedPending = prevOrders.pending.filter(order => order.id !== draggedOrderId);
                    return {
                        ...prevOrders,
                        pending: updatedPending,
                        inProgress: [...prevOrders.inProgress, draggedOrder]
                    };
                });
            }
        }

        // Verificar se o item foi arrastado de 'inProgress' para 'Finished'
        if (over.id === 'Finished' && active.id.startsWith('InProgress-')) {
            const draggedOrderId = active.id.split('-')[1];
            const draggedOrder = orders.inProgress.find(order => order.id === draggedOrderId);
            
            if (draggedOrder) {
                draggedOrder.status = "Finished";
                setOrders(prevOrders => {
                    const updatedInProgress = prevOrders.inProgress.filter(order => order.id !== draggedOrderId);
                    return {
                        ...prevOrders,
                        inProgress: updatedInProgress,
                        finished: [...prevOrders.finished, draggedOrder]
                    };
                });
            }
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-6 p-6">
                {/* Pendentes */}
                <Droppable id="Pending" orders={orders.pending}>
                    <h2 className="text-2xl font-bold text-gray-800">Pendentes</h2>
                </Droppable>

                {/* Em andamento */}
                <Droppable id="InProgress" orders={orders.inProgress}>
                    <h2 className="text-2xl font-bold text-gray-800">Em Andamento</h2>
                </Droppable>

                {/* Finalizados */}
                <Droppable id="Finished" orders={orders.finished}>
                    <h2 className="text-2xl font-bold text-gray-800">Finalizados</h2>
                </Droppable>
            </div>
        </DndContext>
    );
}

interface OrderProps {
    id: string;
    orders: Order[];
    children: React.ReactNode;
}

function Droppable({ id, orders, children }: OrderProps) {
    const { isOver, setNodeRef } = useDroppable({
        id
    });

    const style = {
        padding: '16px',
        borderRadius: '8px',
        border: '2px dashed #d1d5db',
        minHeight: '400px',
        backgroundColor: isOver ? '#f0fdf4' : '#ffffff',
        boxShadow: isOver ? '0 4px 10px rgba(0, 128, 0, 0.2)' : 'none',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        width: '33vw',
        display: 'flex',
        alignItems: 'center', // Centraliza os cards na coluna
        justifyContent: 'flex-start' // Alinha os cards no topo, mas você pode mudar para 'center' se quiser centralizar também verticalmente
    };

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center">
            {children}
            <div className="mt-4 flex flex-col w-full">
                {orders.map((order) => (
                    <Draggable key={order.id} order={order}>
                        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                            {order.order_number}
                        </div>
                    </Draggable>
                ))}
            </div>
        </div>
    );
}

interface DraggableProps {
    order: Order;
    children: React.ReactNode;
}

function Draggable({ order, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${order.status}-${order.id}`, // Garantir que o id é único
    });

    const style = {
        ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        backgroundColor: isDragging ? '#f0f8ff' : 'white', // Cor de fundo enquanto arrasta
        border: isDragging ? '2px solid #007bff' : '1px solid #ccc', // Borda enquanto arrasta
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'move',
        transition: 'background-color 0.2s, border 0.2s',
        justifyContent: 'center' as const,
        textAlign: 'center' as const, // Corrigido para tipo literal 'center'
    };

    return (
        <button ref={setNodeRef} className='w-full' style={style} {...listeners} {...attributes}>
            {children}
        </button>
    );
}

export default App;
