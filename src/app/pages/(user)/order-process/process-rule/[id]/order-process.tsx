import RequestError from '@/app/utils/error';
import FinishOrderProcess from '@/app/api/order-process/finish/order-process';
import StartOrderProcess from '@/app/api/order-process/start/order-process';
import { useModal } from '@/app/context/modal/context';
import OrderProcess from '@/app/entities/order-process/order-process';
import { removeOrderProcess, updateOrderProcess } from '@/redux/slices/order-processes';
import { AppDispatch } from '@/redux/store';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { HiEye, HiPlay, HiCheckCircle } from 'react-icons/hi';
import { useDispatch } from 'react-redux';
import ItemOrderProcess from './item';
import GroupItem from '@/app/entities/order/group-item';
import OrderProcessDetails from './order-process-details';
import { ToUtcTimeWithSeconds } from '@/app/utils/date';

interface OrderProcessCardProps {
    orderProcess: OrderProcess;
};

const OrderProcessCard = ({ orderProcess }: OrderProcessCardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)
    const modalHandler = useModal();

    const groupItem = orderProcess.group_item;
    if (!groupItem) return null;
    
    const startProcess = async (id: string) => {
        if (!data) return

        try {
            await StartOrderProcess(id, data)
            setError(null)
            dispatch(updateOrderProcess({ type: "UPDATE", payload: { id, changes: { status: "Started" } } }))
        } catch (error) {
            setError(error as RequestError)
        }
    }

    const finishProcess = async (id: string) => {
        if (!data) return

        try {
            await FinishOrderProcess(id, data)
            setError(null)
            dispatch(removeOrderProcess(id))
        } catch (error) {
            setError(error as RequestError)
        }
    }

    const openGroupItemDetails = (groupItem: GroupItem) => {
        const onClose = () => {
            modalHandler.hideModal("group-item-details-" + groupItem.id)
        }

        modalHandler.showModal("group-item-details-" + groupItem.id, "# " + groupItem.id,
            <OrderProcessDetails orderProcess={orderProcess} />,
            'lg',
            onClose
        )
    }

    const now = new Date();
    const startAt = new Date(orderProcess.started_at ? orderProcess.started_at : now);
    const duration = new Date(now.getTime() - startAt.getTime());
    
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-6">
            {error && <p className="px-6 py-4 text-red-500">{error.message}</p>}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-semibold">#{groupItem.id}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${orderProcess.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {orderProcess.status}
                    </span>
                </div>
                <button
                    onClick={() => openGroupItemDetails(groupItem)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    <HiEye className="mr-1" /> Ver detalhes
                </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <ul className="space-y-2">
                        {groupItem.items.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded"
                            >
                                <span className="text-gray-800">{item.quantity} x {item.name}</span>
                                {/* additional details can go here */}
                            </li>
                        ))}
                    </ul>
                    {groupItem.observation && (
                        <p className="mt-4 text-sm text-gray-600">
                            <span className="font-semibold text-red-600">OBS:</span> {groupItem.observation}
                        </p>
                    )}
                </div>
                <div className="flex flex-col justify-between items-center md:items-end">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-3xl font-bold text-gray-800">{groupItem.quantity}</p>
                    </div>
                    <div className="w-full">
                        {orderProcess.status === "Pending" && (
                            <button
                                onClick={() => startProcess(orderProcess.id)}
                                className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded"
                            >
                                <HiPlay className="mr-2" /> Iniciar
                            </button>
                        )}
                        {orderProcess.status === "Started" && (
                            <button
                                onClick={() => finishProcess(orderProcess.id)}
                                className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded"
                            >
                                <HiCheckCircle className="mr-2" /> Finalizar
                            </button>
                        )}
                    </div>
                    {orderProcess.status === "Started" && (
                        <p className="mt-2 text-sm text-gray-500">
                            Duração: {ToUtcTimeWithSeconds(duration.toISOString())}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderProcessCard;
