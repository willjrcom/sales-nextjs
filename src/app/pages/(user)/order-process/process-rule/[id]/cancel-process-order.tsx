import OrderProcess from "@/app/entities/order-process/order-process";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useModal } from "@/app/context/modal/context";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeOrderProcess } from "@/redux/slices/order-processes";
import CancelOrderProcessAPI from "@/app/api/order-process/cancel/order-process";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import RequestError from "@/app/utils/error";

interface CancelOrderProcessProps {
    orderProcess: OrderProcess;
}

const CancelOrderProcess = ({ orderProcess }: CancelOrderProcessProps) => {
    const { data } = useSession();
    const modalHandler = useModal();
    const dispatch = useDispatch<AppDispatch>();
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const groupItem = orderProcess.group_item;

    const cancelReasons = [
        "Pedido Cancelado",
        "Observação Errada", 
        "Ingrediente Faltando",
        "Problema Técnico",
        "Cliente Desistiu",
        "Outro"
    ];

    const handleCancelProcess = async () => {
        if (!selectedReason || !data) return;

        setIsLoading(true);
        try {
            await CancelOrderProcessAPI(orderProcess.id, selectedReason, data);
            dispatch(removeOrderProcess(orderProcess.id));
            notifySuccess("Processo cancelado com sucesso!");
            modalHandler.hideModal("order-process-cancel-" + orderProcess.id);
        } catch (error: RequestError | any) {
            notifyError(error.message || 'Erro ao cancelar processo');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {cancelReasons.map((reason) => (
                            <button
                                key={reason}
                                onClick={() => setSelectedReason(reason)}
                                className={`border px-4 py-2 rounded-md font-semibold transition-colors ${
                                    selectedReason === reason
                                        ? 'border-red-500 bg-red-500 text-white'
                                        : 'border-red-500 text-red-500 hover:bg-red-50'
                                }`}
                            >
                                {reason}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6">
                <button 
                    onClick={handleCancelProcess}
                    disabled={!selectedReason || isLoading}
                    className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                        !selectedReason || isLoading
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                >
                    {isLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
            </div>
        </div>
    );
};

export default CancelOrderProcess;
