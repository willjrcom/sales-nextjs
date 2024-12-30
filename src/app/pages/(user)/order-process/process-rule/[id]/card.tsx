import RequestError from '@/app/api/error';
import FinishOrderProcess from '@/app/api/order-process/finish/route';
import StartOrderProcess from '@/app/api/order-process/start/route';
import { useModal } from '@/app/context/modal/context';
import { OrderProcess } from '@/app/entities/order-process/order-process';
import Item from '@/app/entities/order/item';
import { removeOrderProcess, updateOrderProcess } from '@/redux/slices/order-processes';
import { AppDispatch } from '@/redux/store';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import AdditionalItem from './additional-item';
import RemovedItem from './removed-item';

type CardProps = {
    orderProcess: OrderProcess;
};

const CardOrderProcess = ({ orderProcess }: CardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)
    const modalHandler = useModal();
    
    const groupItem = orderProcess.group_item;
    if (!groupItem) return;

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

    const openMoreInfo = (item: Item) => {
        const onClose = () => {
            modalHandler.hideModal("show-process-detail-" + item.id)
        }

        modalHandler.showModal("show-process-detail-" + item.id, item.name, 
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                </div>
                {item.item_to_additional?.map((additional, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <p className="text-md font-bold">{additional.name}</p>
                        <p className="text-sm text-gray-600">Quantidade: {additional.quantity}</p>
                    </div>
                ))}
            </div>,
            'lg',
            onClose
        )
    }

    return (
        <div className="flex flex-col md:flex-row items-center border border-blue-400 rounded-lg p-4 shadow-lg mt-4">
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <div className="flex  justify-between w-full px-4">
                <div className='w-2/3'>
                    {groupItem?.items?.map((item) => (
                        <div key={item.id} className='border p-2 mt-1 cursor-pointer' onClick={() => openMoreInfo(item)}>
                            <p className="text-md">{item.quantity} x {item.name}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {item.item_to_additional?.map((additional) => (
                                    <AdditionalItem key={additional.id} item={additional} />
                                ))}
                            </div>
                            <div className=''>
                                {item.removed_items?.map((removedItem) => (
                                    <RemovedItem key={removedItem} item={removedItem} />
                                ))}
                                </div>
                        </div>
                    ))}
                </div>
                <div className='w-1/3 text-right'>
                    <p className="text-gray-600 font-medium">Quantidade total: <span className="font-bold">{groupItem?.quantity}</span></p>

                    {groupItem?.observation && <p className="mt-4 text-sm text-gray-700">
                        <span className="font-semibold text-red-600">OBS:</span> {groupItem?.observation}
                    </p>}

                    {/* Controles de iniciação e conclusão */}
                    <div className='flex justify-end'>
                        {orderProcess.status === "Pending" && <button onClick={() => startProcess(orderProcess.id)} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 max-w-[10vw]">
                            Iniciar
                        </button>}
                        {orderProcess.status === "Started" &&
                            <button onClick={() => finishProcess(orderProcess.id)} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 max-w-[10vw]">
                                Finalizar
                            </button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardOrderProcess;
