import RequestError from '@/app/utils/error';
import FinishOrderProcess from '@/app/api/order-process/finish/order-process';
import StartOrderProcess from '@/app/api/order-process/start/order-process';
import { useModal } from '@/app/context/modal/context';
import OrderProcess from '@/app/entities/order-process/order-process';
import { removeOrderProcess, updateOrderProcess } from '@/redux/slices/order-processes';
import { AppDispatch } from '@/redux/store';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { HiEye, HiPlay, HiCheckCircle } from 'react-icons/hi';
import { FaRegImage } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import GroupItem from '@/app/entities/order/group-item';
import OrderProcessDetails from './order-process-details';
import { ToUtcMinutesSeconds } from '@/app/utils/date';
import { notifyError } from '@/app/utils/notifications';
import StatusComponent from '@/app/components/button/show-status';
import Item from '@/app/entities/order/item';
import ObservationCard from '@/app/components/order/observation';
import AdditionalItem from './additional-item';
import RemovedItem from './removed-item';

interface OrderProcessCardProps {
    orderProcess: OrderProcess;
};

const OrderProcessCard = ({ orderProcess }: OrderProcessCardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSession();
    const modalHandler = useModal();

    // atualiza o timer a cada segundo para mostrar duração dinâmica
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        if (orderProcess.status === "Started") {
            const timer = setInterval(() => setNow(new Date()), 1000);
            return () => clearInterval(timer);
        }
    }, [orderProcess.status]);

    const groupItem = orderProcess.group_item;
    if (!groupItem) return null;

    const startProcess = async (id: string) => {
        if (!data) return

        try {
            await StartOrderProcess(id, data)
            dispatch(updateOrderProcess({ type: "UPDATE", payload: { id, changes: { status: "Started" } } }))
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao iniciar o pedido');
        }
    }

    const finishProcess = async (id: string) => {
        if (!data) return

        try {
            await FinishOrderProcess(id, data)
            dispatch(removeOrderProcess(id))
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Ocorreu um erro ao finalizar o pedido');
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

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-semibold">Pedido #{orderProcess.order_number} - {orderProcess.order_type}</span>
                    <StatusComponent status={orderProcess?.status} />
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
                    {groupItem.observation && <ObservationCard observation={groupItem.observation} />}
                    <ul className="space-y-2">
                        {groupItem.items.map((item) => {
                            const product = orderProcess.products.find(p => p.id === item.product_id);
                            return <ItemProcessCard item={item} product={product} key={item.id} />;
                        })}
                    </ul>
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
                            Duração: {(() => {
                                const startAt = orderProcess.started_at
                                    ? new Date(orderProcess.started_at)
                                    : new Date();
                                const diffMs = now.getTime() - startAt.getTime();
                                const durationDate = new Date(diffMs);
                                return ToUtcMinutesSeconds(durationDate.toISOString());
                            })()}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ItemProcessProps {
    item: Item;
    product?: any;
}

const ItemProcessCard = ({ item, product }: ItemProcessProps) => {
    return (
        <li key={item.id} className="flex bg-white rounded-lg shadow-sm p-3 items-center">
            {/* Right: item details */}
            <div className="flex-1">
                <div className="flex justify-between">
                    <span className="text-gray-800 font-medium">{item.quantity} x {item.name}</span>
                </div>
                {item.observation && (
                    <ObservationCard observation={item.observation} />
                )}
                <div className="flex flex-wrap mt-2 space-x-2">
                    {item.additional_items?.map(add => (
                        <AdditionalItem item={add} key={add.id} />
                    ))}
                    {item.removed_items?.map(rem => (
                        <RemovedItem item={rem} key={rem} />
                    ))}
                </div>
            </div>
        </li>
    );
};

export default OrderProcessCard;
