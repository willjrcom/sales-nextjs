import RequestError from '@/app/api/error';
import FinishOrderProcess from '@/app/api/order-process/finish/route';
import StartOrderProcess from '@/app/api/order-process/start/route';
import { OrderProcess } from '@/app/entities/order-process/order-process';
import { updateCategory } from '@/redux/slices/categories';
import { removeOrderProcess, updateOrderProcess } from '@/redux/slices/order-processes';
import { AppDispatch, RootState } from '@/redux/store';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type CardProps = {
    orderProcess: OrderProcess;
};

const CardOrderProcess = ({ orderProcess }: CardProps) => {
    const orderProcessesSlice = useSelector((state: RootState) => state.orderProcesses);
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const [error, setError] = useState<RequestError | null>(null)

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

    return (
        <div className="flex flex-col md:flex-row items-center border border-blue-400 rounded-lg p-4 shadow-lg">
            {/* Imagem */}
            <div className="w-full md:w-1/3">
                <Image
                    src={""}
                    alt={""}
                    className="rounded-lg w-full h-auto object-cover"
                />
            </div>

            {/* Conteúdo */}
            <div className="flex flex-col justify-between w-full md:w-2/3 px-4">
                <div className="flex justify-between items-start">
                    {groupItem?.items?.map((item) => (
                        <div key={item.id}>
                            <h2 className="text-xl font-bold text-gray-800">{ }</h2>
                            <p className="text-md">{item.name}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {item.item_to_additional?.map((additional, index) => (
                                    <span
                                        key={index}
                                        className={`px-2 py-1 text-sm rounded-lg ${additional.quantity > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                            }`}
                                    >
                                        {additional.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="text-right">
                        <p className="text-gray-600 font-medium">Quantidade: <span className="font-bold">{groupItem?.quantity}</span></p>
                    </div>
                </div>

                {groupItem?.observation && <p className="mt-4 text-sm text-gray-700">
                    <span className="font-semibold text-red-600">OBS:</span> {groupItem?.observation}
                </p>}

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
    );
};

export default CardOrderProcess;
