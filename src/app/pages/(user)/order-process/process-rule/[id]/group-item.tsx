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
import ItemDetails from './item-details';
import ItemProcessOrder from './item';
import GroupItem from '@/app/entities/order/group-item';
import GroupItemDetails from './group-item-details';

type CardProps = {
    orderProcess: OrderProcess;
};

const GroupItemOrderProcess = ({ orderProcess }: CardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)
    const modalHandler = useModal();

    console.log(orderProcess)
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

    const openGroupItemDetails = (groupItem: GroupItem) => {
        const onClose = () => {
            modalHandler.hideModal("group-item-details-" + groupItem.id)
        }

        modalHandler.showModal("group-item-details-" + groupItem.id, "# " + groupItem.id,
            <GroupItemDetails groupItem={groupItem} />,
            'lg',
            onClose
        )
    }

    return (
        <div className="flex flex-col md:flex-row items-center border border-blue-400 rounded-lg p-4 shadow-lg mt-4">
            {error && <p className="mb-4 text-red-500">{error.message}</p>}
            <div className="flex  justify-between w-full px-4">
                <div className='w-2/3'>
                    {groupItem?.items?.map((item) => <ItemProcessOrder item={item} key={item.id} />)}
                </div>
                <div className='w-1/3 text-right'>
                    <p className="text-gray-600 font-medium">Quantidade total: <span className="font-bold">{groupItem?.quantity}</span></p>

                    {groupItem?.observation && <p className="mt-4 text-sm text-gray-700">
                        <span className="font-semibold text-red-600">OBS:</span> {groupItem?.observation}
                    </p>}

                    {/* Controles de iniciação e conclusão */}
                    <div className='flex justify-end'>
                        <button className="mt-4 mr-4 px-6 py-2 text-yellow-500 underline max-w-[10vw]"
                            onClick={() => openGroupItemDetails(groupItem)}>
                            Ver mais
                        </button>
                        {orderProcess.status === "Pending" && <button onClick={() => startProcess(orderProcess.id)} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 max-w-[10vw]">
                            Iniciar
                        </button>}
                        {orderProcess.status === "Started" &&
                            <button onClick={() => finishProcess(orderProcess.id)} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 max-w-[10vw]">
                                Finalizar
                            </button>}
                    </div>

                    {orderProcess.status === "Started" && 
                        <p className="mt-4 text-sm text-gray-700">
                            Duração: {orderProcess.duration_formatted}
                        </p>
                    }
                </div>
            </div>
        </div>
    );
};

export default GroupItemOrderProcess;
