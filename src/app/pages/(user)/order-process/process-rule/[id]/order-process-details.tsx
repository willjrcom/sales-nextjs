import { useModal } from "@/app/context/modal/context";
import OrderProcess from "@/app/entities/order-process/order-process";
import { ToUtcTimeWithSeconds } from "@/app/utils/date";
import CancelOrderProcess from "./cancel-process-order";

interface OrderProcessDetailsProps {
    orderProcess: OrderProcess;
}

const OrderProcessDetails = ({ orderProcess }: OrderProcessDetailsProps) => {
    const groupItem = orderProcess.group_item;
    const queue = orderProcess.queue;
    const leftAt = queue?.left_at ? queue?.left_at : new Date().toISOString();
    const epochLeftAt = new Date(leftAt).getTime()
    const epochjoinedAt = new Date(queue?.joined_at ?? new Date()).getTime()
    const queueTotalTime = new Date(epochLeftAt - epochjoinedAt);
    const modalHandler = useModal();

    const openCancelOrderProcess = (orderProcess: OrderProcess) => {
        const onClose = () => {
            modalHandler.hideModal("order-process-cancel-" + orderProcess.id)
        }

        modalHandler.showModal("order-process-cancel-" + orderProcess.id, "# " + orderProcess.id,
            <CancelOrderProcess orderProcess={orderProcess} />,
            'lg',
            onClose
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>&nbsp;</div>
                <div className="text-gray-700 text-lg">
                    Quantidade total: <span className="font-bold">{groupItem?.quantity}</span>
                </div>
                <button className="text-gray-500 hover:text-gray-700 focus:outline-none absolute right-4 top-4">
                    ✖
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-2 gap-6">
                {/* Tempo de Processo */}
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <h2 className="font-semibold text-lg mb-4">Tempo de processo</h2>
                    <ul className="space-y-2">
                        <li>Iniciado às: {orderProcess.started_at ? ToUtcTimeWithSeconds(orderProcess.started_at) : "--:--:--"}</li>
                        <li>Pausado às: {orderProcess.paused_at ? ToUtcTimeWithSeconds(orderProcess.paused_at) : "--:--:--"}</li>
                        <li>Continuado às: {orderProcess.continued_at ? ToUtcTimeWithSeconds(orderProcess.continued_at) : "--:--:--"}</li>
                    </ul>
                </div>

                {/* Fila Anterior */}
                <div className="bg-gray-50 rounded-lg shadow p-4">
                    <h2 className="font-semibold text-lg mb-4">Fila anterior</h2>
                    <ul className="space-y-2">
                        <li>Entrou na fila às: {queue?.joined_at ? ToUtcTimeWithSeconds(queue.joined_at) : "--:--:--"}</li>
                        <li>Saiu da fila às: {queue?.left_at ? ToUtcTimeWithSeconds(queue.left_at) : "--:--:--"}</li>
                        <li className="font-bold">Tempo total: {ToUtcTimeWithSeconds(queueTotalTime.toISOString())}</li>
                    </ul>
                </div>
            </div>

            {/* Footer - Botões alinhados abaixo */}
            <div className="flex justify-between items-end mt-8">
                <button className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-700"
                onClick={() => openCancelOrderProcess(orderProcess)}>
                    ✖ Cancelar item
                </button>
            </div>
        </div>
    );
};

export default OrderProcessDetails;
