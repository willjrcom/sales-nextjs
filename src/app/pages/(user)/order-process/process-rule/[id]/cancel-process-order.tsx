import OrderProcess from "@/app/entities/order-process/order-process";

interface CancelOrderProcessProps {
    orderProcess: OrderProcess;
}

const CancelOrderProcess = ({ orderProcess }: CancelOrderProcessProps) => {
    const groupItem = orderProcess.group_item;

    return (
        <div className="bg-white rounded-lg shadow-md w-full max-w-5xl p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>&nbsp;</div>
                <div className="text-gray-700 text-lg">
                    Quantidade: <span className="font-bold">{groupItem?.quantity}</span>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 justify-items-center">
                <div className="flex flex-col items-center space-y-6">
                    <h2 className="text-center font-bold text-lg">
                        Selecione o motivo do cancelamento.
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="border border-red-500 text-red-500 px-4 py-2 rounded-md font-semibold">
                            Pedido Cancelado
                        </button>
                        <button className="border border-red-500 text-red-500 px-4 py-2 rounded-md font-semibold">
                            Pedido Cancelado
                        </button>
                        <button className="border border-red-500 text-red-500 px-4 py-2 rounded-md font-semibold">
                            Observação errada
                        </button>
                        <button className="border border-red-500 text-red-500 px-4 py-2 rounded-md font-semibold">
                            Observação errada
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6">
                <button className="bg-red-500 text-white px-6 py-2 rounded-md font-semibold">
                    Confirmar Cancelamento
                </button>
            </div>
        </div>
    );
};

export default CancelOrderProcess;
